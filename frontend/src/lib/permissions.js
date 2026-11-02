// Internal identifiers remain compatible with existing sessions and database rows.
export const isPlatformReader = role => ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(role);
export const roleLabels = {
    PLATFORM_ADMIN: 'One Horizon admin',
    PLATFORM_USER: 'One Horizon user (read only)',
    CLIENT_ADMIN: 'Client admin',
    CLIENT_USER: 'Client user (read only)',
};
