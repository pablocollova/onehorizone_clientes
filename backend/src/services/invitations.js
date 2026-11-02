const crypto = require('crypto');
const prisma = require('../prisma');
const { sendActivationEmail } = require('./email');

class InvitationError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function inviteUser(actor, input, { requireExplicitRole = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new InvitationError(400, 'Invalid invitation fields');
  }
  const { name, clientId } = input;
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const role = input.role === undefined && !requireExplicitRole ? 'CLIENT_USER' : input.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !['CLIENT_USER', 'CLIENT_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_USER'].includes(role) ||
      (name !== undefined && typeof name !== 'string') ||
      (clientId !== undefined && clientId !== null && typeof clientId !== 'string')) {
    throw new InvitationError(400, 'Invalid invitation fields');
  }
  if (!['CLIENT_ADMIN', 'PLATFORM_ADMIN'].includes(actor.role)) {
    throw new InvitationError(403, 'Forbidden');
  }
  if (actor.role === 'CLIENT_ADMIN' &&
      (!actor.clientId || (clientId && clientId !== actor.clientId) || ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(role))) {
    throw new InvitationError(403, 'Cannot invite outside your client or invite platform admins');
  }
  const isPlatformRole = ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(role);
  const targetClientId = isPlatformRole ? null :
    actor.role === 'CLIENT_ADMIN' ? actor.clientId : clientId;
  if (!isPlatformRole && !targetClientId) {
    throw new InvitationError(400, 'clientId is required for client roles');
  }
  if (isPlatformRole && clientId) {
    throw new InvitationError(400, 'Platform admins cannot belong to a client');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  let user;
  try {
    user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
      // Invitations are not a transfer mechanism, even for a platform admin.
      if (existing && (existing.clientId !== targetClientId ||
          (actor.role === 'CLIENT_ADMIN' && ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(existing.role)))) {
        throw new InvitationError(403, 'Cannot modify an invitation outside the target client');
      }
      if (existing && (existing.status !== 'INVITED' || existing.deletedAt)) {
        throw new InvitationError(400, 'User already exists and is not pending invitation');
      }
      if (targetClientId && !await tx.client.findUnique({ where: { id: targetClientId }, select: { id: true } })) {
        throw new InvitationError(400, 'Client not found');
      }
      const baseUsername = email.split('@')[0];
      const usernameTaken = !existing && await tx.user.findUnique({ where: { username: baseUsername }, select: { id: true } });
      const username = usernameTaken ? `${baseUsername}_${crypto.randomBytes(8).toString('hex')}` : baseUsername;
      const invited = existing
        ? await tx.user.update({ where: { id: existing.id }, data: { name: name?.trim() || existing.name, role } })
        : await tx.user.create({ data: {
          email, username,
          name: name?.trim() || email.split('@')[0], role, clientId: targetClientId, status: 'INVITED',
        } });
      await tx.inviteToken.updateMany({ where: { userId: invited.id, usedAt: null }, data: { usedAt: new Date() } });
      await tx.inviteToken.create({ data: {
        userId: invited.id, tokenHash, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), sentToEmail: email,
      } });
      return invited;
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (['P2034', 'P2002'].includes(error.code)) {
      throw new InvitationError(409, 'Invitation changed concurrently; retry');
    }
    throw error;
  }
  await sendActivationEmail(user.email, rawToken, user.name);
  return `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate?token=${rawToken}`;
}

module.exports = { inviteUser, InvitationError };
