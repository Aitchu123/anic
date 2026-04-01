import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WHATSAPP_SUPPORT_URL } from '../../services/registration';

export default function RegistrationSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('pedido');

  useEffect(() => {
    document.title = 'Pagamento confirmado | ANCI';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <i className="ri-checkbox-circle-fill text-5xl" aria-hidden="true"></i>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Pagamento confirmado</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Seu cadastro profissional foi recebido pela ANCI.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {orderId ? `Pedido ${orderId} confirmado com sucesso.` : 'Seu pagamento foi confirmado com sucesso.'} Nossa equipe agora segue para a analise dos dados e da documentacao informada.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-lg font-semibold text-slate-900">Proximos passos</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>1. A ANCI recebe sua confirmacao de pagamento e registra seu cadastro profissional.</p>
            <p>2. Nossa equipe segue com a analise cadastral e o andamento da carteirinha profissional.</p>
            <p>3. Se precisarmos de algum complemento, o contato sera feito pelos canais informados no cadastro.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="flex-1 rounded-2xl bg-blue-600 px-4 py-4 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Voltar para a home
          </Link>
          <a
            href={WHATSAPP_SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-2xl border border-green-200 px-4 py-4 text-center text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            Suporte pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
