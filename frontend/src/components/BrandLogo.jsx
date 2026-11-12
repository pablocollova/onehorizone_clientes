import './brand-logo.css';

export function BrandLogo({ decorative = false }) {
    return (
        <div className="brand-logo">
            <img src="/images/logo.png" alt={decorative ? '' : 'One Horizon Spain'} width="500" height="500" />
        </div>
    );
}
