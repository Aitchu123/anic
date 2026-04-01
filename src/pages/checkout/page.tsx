import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProfessionalRegistrationFlow from '../../components/registration/ProfessionalRegistrationFlow';

export default function RegistrationPage() {
  const { orderId } = useParams();

  useEffect(() => {
    document.title = orderId ? 'Pagamento via Pix | ANCI' : 'Cadastro Profissional | ANCI';
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-blue-600"
        >
          <span aria-hidden="true">&larr;</span>
          Voltar para a home
        </Link>

        <ProfessionalRegistrationFlow presentation="page" initialOrderId={orderId} />
      </div>
    </div>
  );
}
