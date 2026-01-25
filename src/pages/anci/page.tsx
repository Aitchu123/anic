import { useEffect } from 'react';

export default function AnciValidation() {
  useEffect(() => {
    document.title = 'Validação de Carteirinha | ANCI';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-8 animate-fade-in">
        
        {/* Logo ANCI */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">ANCI</span>
          </div>
        </div>

        {/* Status de Validação */}
        <div className="space-y-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <i className="ri-checkbox-circle-fill text-6xl text-green-500"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            Carteirinha VALIDADA pela ANCI
          </h1>
          
          <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
        </div>

        {/* Detalhes da Validação */}
        <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 space-y-4 text-left border border-gray-100">
          <div className="flex items-start space-x-3">
            <i className="ri-shield-check-fill text-green-600 text-lg mt-0.5"></i>
            <p>Todos os documentos do Instrumentador foram <strong className="text-gray-800">checados e autenticados</strong>.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <i className="ri-time-fill text-green-600 text-lg mt-0.5"></i>
            <p>Número de horas exigidas e grade escolar do instrumentador foram <strong className="text-gray-800">comprovadas</strong>.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <i className="ri-hospital-fill text-green-600 text-lg mt-0.5"></i>
            <p>Estágio na área de instrumentação <strong className="text-gray-800">comprovado</strong>.</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ANCI - Agência Nacional de Instrumentadores Cirúrgicos.
            <br />
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
