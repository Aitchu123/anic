import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WHATSAPP_SUPPORT_URL } from '../../services/registration';

export default function RegistrationExpiredPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('pedido');

  useEffect(() => {
    document.title = 'Pagamento indisponivel | ANCI';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <i className="ri-time-line text-5xl" aria-hidden="true"></i>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Pix indisponivel</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Seu pagamento nao ficou pronto para uso.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Isso pode acontecer quando o Pix expira imediatamente ou quando a cobranca volta com dados inconsistentes. A ANCI nao mostra um pagamento invalido como se estivesse funcionando.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">Como continuar</p>
          <p className="mt-3">1. Gere um novo Pix para receber uma nova cobranca.</p>
          <p>2. Se precisar, fale com a equipe da ANCI pelo WhatsApp.</p>
          {orderId ? <p className="mt-3 font-medium text-slate-700">Pedido relacionado: {orderId}</p> : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={orderId ? `/checkout/${orderId}` : '/checkout'}
            className="flex-1 rounded-2xl bg-blue-600 px-4 py-4 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Gerar novo Pix
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
