import { useState, useEffect, useRef } from 'react';
import ProfessionalRegistrationFlow from '../../components/registration/ProfessionalRegistrationFlow';
import { getApiBaseUrl } from '../../services/registration';

// Hook personalizado para animação de contadores
const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
};

// Componente de contador animado
const AnimatedCounter = ({ 
  end, 
  suffix = '', 
  prefix = '', 
  className = '',
  duration = 2000 
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) => {
  const { count, ref } = useCountUp(end, duration);
  
  return (
    <div ref={ref} className={className}>
      {prefix}{count}{suffix}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('beneficios');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SEO: Atualizar título da página baseado na aba ativa
  useEffect(() => {
    const titles = {
      'beneficios': 'Benefícios do Cadastro | ANCI - Instrumentadores Cirúrgicos',
      'como-funciona': 'Como Funciona o Cadastro | ANCI - Instrumentadores Cirúrgicos',
      'cadastro': 'Fazer Cadastro Profissional | ANCI - Instrumentadores Cirúrgicos',
      'contato': 'Contato | ANCI - Instrumentadores Cirúrgicos'
    };
    document.title = titles[activeTab as keyof typeof titles] || 'ANCI - Cadastro Nacional de Instrumentadores Cirúrgicos';
  }, [activeTab]);

  // Base da API para ambiente local: se estiver em localhost e não na porta 3737, direciona para o backend
  const apiBase = getApiBaseUrl();

  const handleContatoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
      data.append(key, value.toString());
    }

    try {
      const response = await fetch(`${apiBase}/api/form/contato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (response.ok) {
        alert('Mensagem enviada com sucesso! Responderemos em breve.');
        e.currentTarget.reset();
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    } catch {
      alert('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header com SEO otimizado */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-xl">
                <span className="text-white font-bold text-base sm:text-xl" aria-label="Logo ANCI">ANCI</span>
              </div>
              <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">ANCI</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Agência Nacional de Instrumentadores Cirúrgicos</p>
              </div>
            </div>
            
            {/* Menu desktop */}
            <nav className="hidden md:flex space-x-2" role="navigation" aria-label="Menu principal">
              <button 
                onClick={() => setActiveTab('beneficios')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm lg:text-base ${
                  activeTab === 'beneficios' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-current={activeTab === 'beneficios' ? 'page' : undefined}
              >
                Benefícios
              </button>
              <button 
                onClick={() => setActiveTab('como-funciona')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm lg:text-base ${
                  activeTab === 'como-funciona' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-current={activeTab === 'como-funciona' ? 'page' : undefined}
              >
                Como Funciona
              </button>
              <button 
                onClick={() => setActiveTab('cadastro')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm lg:text-base ${
                  activeTab === 'cadastro' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-current={activeTab === 'cadastro' ? 'page' : undefined}
              >
                Cadastro
              </button>
              <button 
                onClick={() => setActiveTab('contato')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm lg:text-base ${
                  activeTab === 'contato' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-current={activeTab === 'contato' ? 'page' : undefined}
              >
                Contato
              </button>
            </nav>

            {/* Menu mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                aria-label="Abrir menu de navegação"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu mobile expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 mt-3 pt-3 animate-fade-in">
              <div className="flex flex-col space-y-2">
                {['beneficios', 'como-funciona', 'cadastro', 'contato'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium text-left transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {tab === 'beneficios' && 'Benefícios'}
                    {tab === 'como-funciona' && 'Como Funciona'}
                    {tab === 'cadastro' && 'Cadastro'}
                    {tab === 'contato' && 'Contato'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section com SEO otimizado */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-20 lg:py-24 overflow-hidden" role="banner">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-1/3 w-6 h-6 sm:w-8 sm:h-8 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-8 h-8 sm:w-10 sm:h-10 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed font-medium opacity-90 animate-fade-in-up px-4 sm:px-0" style={{animationDelay: '0.2s'}}>
              Primeira Agência Nacional dedicada exclusivamente aos profissionais de instrumentação cirúrgica. 
              Obtenha reconhecimento oficial, carteirinha profissional numerada e documentação organizada. 
              Contribua para a regulamentação e valorização da profissão no Brasil.
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up px-4 sm:px-0" style={{animationDelay: '0.4s'}}>
              <button 
                onClick={() => setActiveTab('cadastro')}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl whitespace-nowrap group active:scale-95 text-sm sm:text-base"
                aria-label="Fazer cadastro profissional de instrumentador cirúrgico"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                  Fazer Cadastro Profissional
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('como-funciona')}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 whitespace-nowrap group active:scale-95 text-sm sm:text-base"
                aria-label="Saiba como funciona o cadastro"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                  Como Funciona o Processo
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb para SEO */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><a href="/" className="hover:text-blue-600">Início</a></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-blue-600 font-medium">
            {activeTab === 'beneficios' && 'Benefícios do Cadastro'}
            {activeTab === 'como-funciona' && 'Como Funciona'}
            {activeTab === 'cadastro' && 'Fazer Cadastro'}
            {activeTab === 'contato' && 'Contato'}
          </li>
        </ol>
      </nav>

      {/* Main Content com estrutura semântica */}
      <main className="container mx-auto px-6 py-12" role="main">
        {/* Benefícios */}
        {activeTab === 'beneficios' && (
          <section className="space-y-12" aria-labelledby="beneficios-title">
              <div className="text-center mb-8">
                <h2 id="beneficios-title" className="text-4xl font-bold text-gray-800 mb-6">
                  Vantagens Exclusivas da Agência Nacional ANCI
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                  Descubra por que mais de 1.000 instrumentadores cirúrgicos já escolheram a ANCI para seu reconhecimento profissional
                </p>

                {/* Seção das Carteirinhas */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-5xl mx-auto mb-16">
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">Modelo da Nossa Carteirinha</h3>
                  <p className="text-gray-600 mb-8 italic">Uma demonstração de como é o documento oficial do instrumentador cadastrado</p>
                  
                  <div className="grid md:grid-cols-2 gap-8 items-center justify-center">
                    <div className="space-y-4 transform hover:scale-105 transition-transform duration-500">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-xl shadow-inner">
                        <img 
                          src="https://lh3.googleusercontent.com/d/1qte0bDRz_g20Hp_14f3nnL9jeBy42niG" 
                          alt="Frente da Carteirinha ANCI" 
                          className="w-full h-auto rounded-lg shadow-2xl"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (!img.src.includes('uc?export=view')) {
                              img.src = 'https://drive.google.com/uc?export=view&id=1qte0bDRz_g20Hp_14f3nnL9jeBy42niG';
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Frente do Documento</p>
                    </div>
                    
                    <div className="space-y-4 transform hover:scale-105 transition-transform duration-500">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-xl shadow-inner">
                        <img 
                          src="https://lh3.googleusercontent.com/d/1QZvn5IOwG7EPUkHy-bRW3QGruhqZPUQI" 
                          alt="Verso da Carteirinha ANCI" 
                          className="w-full h-auto rounded-lg shadow-2xl"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (!img.src.includes('uc?export=view')) {
                              img.src = 'https://drive.google.com/uc?export=view&id=1QZvn5IOwG7EPUkHy-bRW3QGruhqZPUQI';
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Verso do Documento</p>
                    </div>
                  </div>
                  
                  <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100 inline-block">
                    <p className="text-blue-800 text-sm flex items-center justify-center">
                      <i className="ri-shield-check-line mr-2 text-xl"></i>
                      Documento oficial produzido em PVC (mesmo material de cartões de crédito) com numeração única nacional e validação digital via QR Code.
                    </p>
                  </div>
                </div>
              </div>

            {/* Benefícios detalhados com palavras-chave SEO */}
            <div className="grid md:grid-cols-3 gap-8">
              <article className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="ri-shield-check-line text-2xl text-blue-600" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4">Reconhecimento Profissional Nacional</h3>
                <p className="text-gray-600">
                  Primeira carteirinha oficial de instrumentador cirúrgico do Brasil. Documento reconhecido nacionalmente 
                  que comprova sua qualificação profissional em qualquer hospital, clínica ou centro cirúrgico do país.
                </p>
              </article>

              <article className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="ri-file-text-line text-2xl text-green-600" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4">Documentação Profissional Organizada</h3>
                <p className="text-gray-600">
                  Sistema único de cadastro que organiza e valida toda documentação do instrumentador cirúrgico. 
                  Facilita processos seletivos, contratações e comprovação de experiência profissional.
                </p>
              </article>

              <article className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="ri-team-line text-2xl text-purple-600" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-semibold mb-4">Rede Nacional de Profissionais</h3>
                <p className="text-gray-600">
                  Integre a maior rede de instrumentadores cirúrgicos do Brasil. Networking profissional, 
                  oportunidades de trabalho e fortalecimento da categoria em todo território nacional.
                </p>
              </article>
            </div>

            {/* Seção de diferenciais competitivos */}
            <article className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Por que a ANCI é Superior aos Demais Cadastros?</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Primeira agência nacional</strong> exclusiva para instrumentadores</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Carteirinha plastificada oficial</strong> com numeração única nacional</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Processo 100% digital</strong> - sem burocracias desnecessárias</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Taxa única de R$ 90,00</strong> - sem anuidades ou mensalidades</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Reconhecimento em todo Brasil</strong> - validade nacional</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Contribui para regulamentação</strong> da profissão no país</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Atendimento especializado</strong> por profissionais da área</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Documentação organizada</strong> e sempre acessível</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Seção de estatísticas e credibilidade com contadores animados */}
            <article className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ANCI em Números</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    <AnimatedCounter end={1250} duration={2000} />+
                  </div>
                  <p className="text-gray-600">Instrumentadores Cadastrados</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    <AnimatedCounter end={27} duration={1800} />
                  </div>
                  <p className="text-gray-600">Estados Atendidos</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    <AnimatedCounter end={100} duration={2200} />%
                  </div>
                  <p className="text-gray-600">Processo Digital</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    <AnimatedCounter end={15} duration={1500} /> dias
                  </div>
                  <p className="text-gray-600">Prazo Máximo de Análise</p>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Como Funciona com SEO otimizado */}
        {activeTab === 'como-funciona' && (
          <section className="space-y-12" aria-labelledby="como-funciona-title">
            <div className="text-center">
              <h2 id="como-funciona-title" className="text-4xl font-bold text-gray-800 mb-6">
                Processo Completo de Cadastro Nacional
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Passo a passo detalhado para obter sua carteirinha profissional de instrumentador cirúrgico
              </p>
            </div>

            {/* Processo detalhado */}
            <div className="grid md:grid-cols-4 gap-6">
              <article className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="font-semibold mb-2">Preenchimento da Ficha Cadastral</h3>
                <p className="text-sm text-gray-600">Complete o formulário online com dados pessoais, profissionais e de formação em instrumentação cirúrgica</p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="font-semibold mb-2">Envio de Documentação</h3>
                <p className="text-sm text-gray-600">Envie certificados, documentos pessoais e foto 3x4 por e-mail para análise da equipe técnica</p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="font-semibold mb-2">Análise Técnica Especializada</h3>
                <p className="text-sm text-gray-600">Verificação da documentação por profissionais especializados em instrumentação cirúrgica (até 15 dias)</p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="font-semibold mb-2">Emissão da Carteirinha</h3>
                <p className="text-sm text-gray-600">Após pagamento, produção e envio da carteirinha oficial pelos correios com numeração única</p>
              </article>
            </div>

            {/* Documentos Necessários com SEO */}
            <article className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Documentação Obrigatória para Instrumentadores Cirúrgicos</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <i className="ri-image-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>Foto 3x4 recente</strong> - fundo branco, sem óculos escuros</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-file-text-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>Ficha cadastral ANCI</strong> - preenchida completamente</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-id-card-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>RG e CPF</strong> - cópias legíveis frente e verso</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <i className="ri-award-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>Certificado de Instrumentação Cirúrgica</strong> - reconhecido pelo MEC</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-home-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>Comprovante de endereço</strong> - máximo 3 meses</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-briefcase-line text-blue-600 text-xl" aria-hidden="true"></i>
                    <span><strong>Comprovante de experiência</strong> - se houver (opcional)</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Investimento com comparativo */}
            <article className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Investimento Único e Acessível</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">R$ 90,00</div>
                <p className="text-lg text-gray-600 mb-4">Taxa única - Sem anuidade ou mensalidade</p>
                <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto">
                  <h4 className="font-semibold mb-3 text-gray-800">O que está incluso:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Análise técnica especializada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Carteirinha plastificada oficial</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Numeração única nacional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Envio pelos correios</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Cadastro permanente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-check-line text-green-600" aria-hidden="true"></i>
                      <span>Suporte técnico vitalício</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sistema de numeração */}
            <article className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Sistema de Numeração Nacional ANCI</h3>
              <p className="text-gray-600 mb-6">
                A ANCI desenvolveu um sistema único de numeração que permite identificar rapidamente a origem, 
                formação e registro de cada instrumentador cirúrgico cadastrado no Brasil.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 text-blue-800">Estrutura da Numeração Profissional:</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded">
                    <strong className="text-blue-600">Código do Estado</strong>
                    <p className="text-gray-600 mt-1">Identifica o estado de origem do profissional</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <strong className="text-blue-600">Sequência Numérica</strong>
                    <p className="text-gray-600 mt-1">Ordem cronológica de cadastro no estado</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <strong className="text-blue-600">Ano de Registro</strong>
                    <p className="text-gray-600 mt-1">Ano de emissão da carteirinha profissional</p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Cadastro */}
        {activeTab === 'cadastro' && (
          <section className="space-y-12">
            <ProfessionalRegistrationFlow presentation="embedded" />
          </section>
        )}

        {/* Contato */}
        {activeTab === 'contato' && (
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Entre em Contato</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tem dúvidas sobre o cadastro? Entre em contato conosco
              </p>
            </div>

            {/* Destaque do Email Principal */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-mail-line text-3xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Atendimento Profissional</h3>
                    <p className="text-blue-100">Suporte especializado para instrumentadores cirúrgicos</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4">
                  <p className="text-lg mb-2">📧 Email Principal para Dúvidas:</p>
                  <a 
                    href="mailto:duvidas@anci.live" 
                    className="text-3xl font-bold text-white hover:text-blue-200 transition-colors duration-300 inline-block transform hover:scale-105"
                  >
                    duvidas@anci.live
                  </a>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <i className="ri-time-line text-lg mb-1 block"></i>
                    <p className="font-semibold">Resposta em até</p>
                    <p>48 horas úteis</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <i className="ri-shield-check-line text-lg mb-1 block"></i>
                    <p className="font-semibold">Atendimento</p>
                    <p>100% Profissional</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <i className="ri-user-heart-line text-lg mb-1 block"></i>
                    <p className="font-semibold">Especializado</p>
                    <p>Para Instrumentadores</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  Ou envie sua mensagem pelo formulário
                </h3>
                <form onSubmit={handleContatoSubmit} data-readdy-form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                    <input 
                      type="text" 
                      name="nome"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                    <select 
                      name="assunto"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      <option value="">Selecione o assunto</option>
                      <option value="duvidas-cadastro">Dúvidas sobre cadastro</option>
                      <option value="documentacao">Documentação</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="carteirinha">Carteirinha</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                    <textarea 
                      name="mensagem"
                      required
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Descreva sua dúvida ou mensagem (máximo 500 caracteres)"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>

              <div className="mt-8 space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <i className="ri-information-line mr-2"></i>
                    Informações Importantes
                  </h3>
                  <div className="space-y-3 text-blue-700">
                    <div className="flex items-start space-x-3">
                      <i className="ri-mail-line text-blue-600 mt-1"></i>
                      <p>Todas as comunicações são feitas exclusivamente por e-mail</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="ri-time-line text-blue-600 mt-1"></i>
                      <p>Tempo de resposta: até 48 horas úteis</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="ri-shield-check-line text-blue-600 mt-1"></i>
                      <p>Atendimento profissional especializado em instrumentação cirúrgica</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                    <i className="ri-contacts-line mr-2"></i>
                    Canais de Atendimento Especializados
                  </h3>
                  <div className="grid md:grid-cols-1 gap-4 justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 max-w-md mx-auto">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-question-line text-green-600"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">Atendimento Geral</p>
                          <p className="text-sm text-green-600">Dúvidas, cadastro e documentação</p>
                        </div>
                      </div>
                      <a 
                        href="mailto:duvidas@anci.live" 
                        className="text-green-700 font-semibold hover:text-green-800 transition-colors flex items-center"
                      >
                        <i className="ri-mail-line mr-2"></i>
                        duvidas@anci.live
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer com SEO otimizado */}
      <footer className="bg-gray-800 text-white py-12" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">ANCI</span>
                </div>
                <div>
                  <h3 className="font-bold">ANCI</h3>
                  <p className="text-sm text-gray-400">Agência Nacional</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Primeira agência nacional dedicada exclusivamente aos instrumentadores cirúrgicos do Brasil. 
                Organizando, documentando e valorizando a profissão em todo território nacional.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços ANCI</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => setActiveTab('beneficios')} className="block text-gray-400 hover:text-white transition-colors">
                  Cadastro Nacional
                </button>
                <button onClick={() => setActiveTab('como-funciona')} className="block text-gray-400 hover:text-white transition-colors">
                  Carteirinha Profissional
                </button>
                <button onClick={() => setActiveTab('cadastro')} className="block text-gray-400 hover:text-white transition-colors">
                  Documentação Organizada
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center">
                <i className="ri-customer-service-2-line mr-2"></i>
                Contato Profissional
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-300 mb-1">📧 Dúvidas Gerais:</p>
                  <a 
                    href="mailto:duvidas@anci.live" 
                    className="text-white font-semibold hover:text-blue-300 transition-colors"
                  >
                    duvidas@anci.live
                  </a>
                </div>
                <div className="space-y-2 text-gray-400">
                  <p className="text-xs">✉️ Atendimento exclusivo por e-mail</p>
                  <p className="text-xs">⏱️ Resposta em até 48h úteis</p>
                  <p className="text-xs">📋 Dúvidas, cadastro e documentação</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Informações do Cadastro</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong>Investimento:</strong> R$ 90,00 taxa única</p>
                <p><strong>Validade:</strong> Permanente</p>
                <p><strong>Abrangência:</strong> Nacional</p>
                <p><strong>Prazo:</strong> Até 15 dias úteis</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 ANCI - Agência Nacional de Instrumentadores Cirúrgicos. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
