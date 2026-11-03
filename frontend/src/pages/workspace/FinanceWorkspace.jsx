import { useSearchParams } from 'react-router-dom';
import { PageHeading } from '../../components/workspace/WorkspaceUI';
import { AccountsWorkspace } from '../AccountsWorkspace';

export function FinanceWorkspace() {
    const [params] = useSearchParams();
    const initialClientId = params.get('clientId') || '';
    return <><PageHeading title="Pagos y cuenta corriente" description="De la factura al pago confirmado. Consultá movimientos, registrá pagos y aplicalos a las facturas correspondientes." /><div className="workspace-finance"><AccountsWorkspace key={initialClientId} initialClientId={initialClientId} organized /></div></>;
}
