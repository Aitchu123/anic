
import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('beneficios');

  // SEO: Atualizar título da página baseado na aba ativa
  useEffect(() => {
    const titles = {
      'beneficios': 'Benefícios do Cadastro | ANIC - Instrumentadores Cirúrgicos',
      'como-funciona': 'Como Funciona o Cadastro | ANIC - Instrumentadores Cirúrgicos',
      'cadastro': 'Fazer Cadastro Profissional | ANIC - Instrumentadores Cirúrgicos',
      'contato': 'Contato | ANIC - Instrumentadores Cirúrgicos'
    };
    document.title = titles[activeTab as keyof typeof titles] || 'ANIC - Cadastro Nacional de Instrumentadores Cirúrgicos';
  }, [activeTab]);

  const handleCadastroSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
      data.append(key, value.toString());
    }

    try {
      const response = await fetch('https://readdy.ai/api/form/d3vnrv4um42jkjthsl6g', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (response.ok) {
        alert('Ficha cadastral enviada com sucesso! Você receberá um e-mail com as próximas instruções.');
        e.currentTarget.reset();
      } else {
        alert('Erro ao enviar ficha cadastral. Tente novamente.');
      }
    } catch (error) {
      alert('Erro ao enviar ficha cadastral. Verifique sua conexão e tente novamente.');
    }
  };

  const handleContatoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
      data.append(key, value.toString());
    }

    try {
      const response = await fetch('https://readdy.ai/api/form/d3vncbnlh2s7bsogu81g', {
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
    } catch (error) {
      alert('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header com SEO otimizado */}
      <header className="bg-white shadow-lg" role="banner">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl" aria-label="Logo ANIC">ANIC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ANIC</h1>
                <p className="text-sm text-gray-600">Associação Nacional de Instrumentadores Cirúrgicos</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Menu principal">
              <button 
                onClick={() => setActiveTab('beneficios')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'beneficios' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                aria-current={activeTab === 'beneficios' ? 'page' : undefined}
              >
                Benefícios
              </button>
              <button 
                onClick={() => setActiveTab('como-funciona')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'como-funciona' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                aria-current={activeTab === 'como-funciona' ? 'page' : undefined}
              >
                Como Funciona
              </button>
              <button 
                onClick={() => setActiveTab('cadastro')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'cadastro' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                aria-current={activeTab === 'cadastro' ? 'page' : undefined}
              >
                Cadastro
              </button>
              <button 
                onClick={() => setActiveTab('contato')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'contato' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                aria-current={activeTab === 'contato' ? 'page' : undefined}
              >
                Contato
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section com SEO otimizado */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20" role="banner">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Cadastro Nacional de Instrumentadores Cirúrgicos - ANIC
            </h1>
            <h2 className="text-xl mb-8 leading-relaxed font-medium">
              Primeira Associação Nacional dedicada exclusivamente aos profissionais de instrumentação cirúrgica. 
              Obtenha reconhecimento oficial, carteirinha profissional numerada e documentação organizada. 
              Contribua para a regulamentação e valorização da profissão no Brasil.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setActiveTab('cadastro')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                aria-label="Fazer cadastro profissional de instrumentador cirúrgico"
              >
                Fazer Cadastro Profissional
              </button>
              <button 
                onClick={() => setActiveTab('como-funciona')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors whitespace-nowrap"
                aria-label="Saiba como funciona o cadastro"
              >
                Como Funciona o Processo
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
            <div className="text-center">
              <h2 id="beneficios-title" className="text-4xl font-bold text-gray-800 mb-6">
                Vantagens Exclusivas do Cadastro Nacional ANIC
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubra por que mais de 1.000 instrumentadores cirúrgicos já escolheram a ANIC para seu reconhecimento profissional
              </p>
            </div>

            {/* Modelo da Carteirinha com SEO otimizado */}
            <article className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Carteirinha Profissional Oficial ANIC</h3>
                <p className="text-gray-600 mb-6">
                  Modelo oficial da carteirinha de instrumentador cirúrgico cadastrado nacionalmente - 
                  Documento reconhecido em todo território brasileiro
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg max-w-md">
                    <img 
                      src="https://static.readdy.ai/image/0e5b39016bc5f2c093060177f0429e20/8924083f1f2960b76f7d0018a1fff5aa.jpeg"
                      alt="Carteirinha profissional oficial ANIC para instrumentadores cirúrgicos - modelo com foto, dados pessoais e numeração única nacional"
                      className="w-full h-auto rounded-lg shadow-md"
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Carteirinha plastificada com numeração única nacional, foto 3x4, dados profissionais e QR Code de verificação
                </p>
              </div>
            </article>

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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Por que a ANIC é Superior aos Demais Cadastros?</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="ri-check-line text-green-600 text-xl" aria-hidden="true"></i>
                      <span><strong>Primeira associação nacional</strong> exclusiva para instrumentadores</span>
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

            {/* Seção de estatísticas e credibilidade */}
            <article className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ANIC em Números</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <p className="text-gray-600">Instrumentadores Cadastrados</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">27</div>
                  <p className="text-gray-600">Estados Atendidos</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <p className="text-gray-600">Processo Digital</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-orange-600 mb-2">15 dias</div>
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
                    <span><strong>Ficha cadastral ANIC</strong> - preenchida completamente</span>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Sistema de Numeração Nacional ANIC</h3>
              <p className="text-gray-600 mb-6">
                A ANIC desenvolveu um sistema único de numeração que permite identificar rapidamente a origem, 
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
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Faça seu Cadastro</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Preencha a ficha cadastral para iniciar seu processo de cadastro profissional
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleCadastroSubmit} data-readdy-form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                      <input 
                        type="text" 
                        name="nome_completo"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                      <input 
                        type="text" 
                        name="cpf"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">RG *</label>
                      <input 
                        type="text" 
                        name="rg"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite seu RG"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                      <input 
                        type="date" 
                        name="data_nascimento"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                      <input 
                        type="tel" 
                        name="telefone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço Completo *</label>
                    <input 
                      type="text" 
                      name="endereco"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua, número, bairro, cidade, estado, CEP"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                      <select 
                        name="estado"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      >
                        <option value="">Selecione seu estado</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instituição de Formação *</label>
                      <input 
                        type="text" 
                        name="instituicao_formacao"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da instituição onde se formou"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ano de Conclusão *</label>
                      <input 
                        type="number" 
                        name="ano_conclusao"
                        required
                        min="1980"
                        max="2024"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Experiência</label>
                      <select 
                        name="tempo_experiencia"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      >
                        <option value="">Selecione</option>
                        <option value="menos-1-ano">Menos de 1 ano</option>
                        <option value="1-3-anos">1 a 3 anos</option>
                        <option value="3-5-anos">3 a 5 anos</option>
                        <option value="5-10-anos">5 a 10 anos</option>
                        <option value="mais-10-anos">Mais de 10 anos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea 
                      name="observacoes"
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Informações adicionais (máximo 500 caracteres)"
                    ></textarea>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Próximos Passos:</h4>
                    <p className="text-sm text-yellow-700">
                      Após enviar esta ficha, você receberá um e-mail com instruções para envio da documentação necessária.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Enviar Ficha Cadastral
                  </button>
                </form>
              </div>

              <div className="mt-8 bg-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Envio de Documentação</h3>
                <p className="text-blue-700 mb-4">
                  Após preencher a ficha cadastral, envie toda a documentação para:
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-blue-800">cadastro@anic.live</p>
                </div>
                <p className="text-sm text-blue-600 mt-3">
                  A aprovação da documentação dura em média 15 dias. Após aprovada, você receberá um e-mail com as informações para pagamento.
                </p>
              </div>
            </div>
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

            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg">
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
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Informações Importantes</h3>
                  <div className="space-y-3 text-blue-700">
                    <p>• Não temos atendimento presencial ou por telefone</p>
                    <p>• Todas as comunicações são feitas por e-mail</p>
                    <p>• Tempo de resposta: até 48 horas úteis</p>
                    <p>• Para dúvidas sobre documentação: documentacao@anic.live</p>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">E-mails de Contato</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <i className="ri-mail-line text-green-600"></i>
                      <div>
                        <p className="font-semibold">Dúvidas Gerais:</p>
                        <p className="text-green-700">duvidas@anic.live</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="ri-file-text-line text-green-600"></i>
                      <div>
                        <p className="font-semibold">Documentação:</p>
                        <p className="text-green-700">cadastro@anic.live</p>
                      </div>
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
                  <span className="text-white font-bold">ANIC</span>
                </div>
                <div>
                  <h3 className="font-bold">ANIC</h3>
                  <p className="text-sm text-gray-400">Associação Nacional</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Primeira associação nacional dedicada exclusivamente aos instrumentadores cirúrgicos do Brasil. 
                Organizando, documentando e valorizando a profissão em todo território nacional.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços ANIC</h4>
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
              <h4 className="font-semibold mb-4">Contato Profissional</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong>Dúvidas:</strong> duvidas@anic.live</p>
                <p><strong>Cadastro:</strong> cadastro@anic.live</p>
                <p><strong>Documentação:</strong> documentacao@anic.live</p>
                <p>Atendimento exclusivo por e-mail</p>
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
                © 2024 ANIC - Associação Nacional de Instrumentadores Cirúrgicos. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
