import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Send, Building2, Target, Users, DollarSign, TrendingUp, BarChart3, Download, CheckCircle2, Award } from 'lucide-react';
import axios from 'axios';

// --- ИНТЕРФЕЙСЫ ---

interface ProjectData {
  overview: {
    projectName: string;
    description: string;
    category: string;
    stage: string;
  };
  businessModel: {
    revenueStreams: string;
    targetMarket: string;
    valueProposition: string;
  };
  competitors: {
    mainCompetitors: string;
  };
  team: {
    founders: string;
    teamSize: string;
  };
  financials: {
    fundingNeeded: string;
    currentRevenue: string;
    projectedRevenue: string;
  };
}

interface ApiResponse {
  analogs: Array<{
    name: string;
    description: string;
    businessModel: string;
    funding: string;
    stage: string;
    similarity: number;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
  }>;
  recommendations: string[];
  analysisTimestamp: string;
  totalAnalogs: number;
}

// Новый интерфейс для грантов
interface Grant {
  name: string;
  why: string;
}

interface GrantApiResponse {
  grants: Grant[];
}

const initialData: ProjectData = {
  overview: { projectName: '', description: '', category: '', stage: '' },
  businessModel: { revenueStreams: '', targetMarket: '', valueProposition: '' },
  competitors: { mainCompetitors: '' },
  team: { founders: '', teamSize: '' },
  financials: { fundingNeeded: '', currentRevenue: '', projectedRevenue: '' }
};


// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>(initialData);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const sections = [
    { id: 'overview', title: 'Обзор проекта', icon: Building2 },
    { id: 'businessModel', title: 'Бизнес-модель', icon: Target },
    { id: 'competitors', title: 'Конкуренты', icon: TrendingUp },
    { id: 'team', title: 'Команда', icon: Users },
    { id: 'financials', title: 'Финансы', icon: DollarSign }
  ];

  const sectionFields = {
    overview: ['projectName', 'description', 'category', 'stage'],
    businessModel: ['revenueStreams', 'targetMarket', 'valueProposition'],
    competitors: ['mainCompetitors'],
    team: ['founders', 'teamSize'],
    financials: ['fundingNeeded', 'currentRevenue', 'projectedRevenue']
  } as const;

  type SectionKey = keyof typeof sectionFields;

  const updateSection = (section: keyof ProjectData, field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getSectionCompletion = (sectionKey: SectionKey) => {
    const fields = sectionFields[sectionKey];
    const filledFields = fields.filter(field =>
      projectData[sectionKey][field as keyof typeof projectData[typeof sectionKey]].trim() !== ''
    ).length;
    return (filledFields / fields.length) * 100;
  };

  const getTotalCompletion = () => {
    const sections = Object.keys(sectionFields) as SectionKey[];
    const completions = sections.map(section => getSectionCompletion(section));
    return completions.reduce((sum, completion) => sum + completion, 0) / completions.length;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const apiData = {
      businessModel: projectData.businessModel,
      competitors: projectData.competitors,
      financials: projectData.financials,
      overview: projectData.overview,
      team: projectData.team
    };

    try {
      const response = await axios.post('https://45.151.30.224.sslip.io/analyze', apiData);
      setApiResponse(response.data);
      setIsSubmitting(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting data:', error);
      setIsSubmitting(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${projectData.overview.projectName || 'project'}-application.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (showResults) {
    return <ResultsPage projectData={projectData} apiResponse={apiResponse} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Заявка проекта
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Подайте заявку вашего проекта для получения комплексного анализа
          </p>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-emerald-200">Прогресс</span>
              <span className="text-sm font-medium text-emerald-200">{Math.round(getTotalCompletion())}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-lime-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getTotalCompletion()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Разделы</h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const completion = getSectionCompletion(section.id as SectionKey);
                    return (
                      <button
                        key={section.id}
                        onClick={() => setCurrentSection(index)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          currentSection === index
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-100'
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-emerald-200'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1 text-left text-sm font-medium">{section.title}</span>
                        {completion === 100 && (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {sections[currentSection].title}
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full"></div>
                </div>

                <div className="space-y-6">
                  {currentSection === 0 && <OverviewSection projectData={projectData} updateSection={updateSection} />}
                  {currentSection === 1 && <BusinessModelSection projectData={projectData} updateSection={updateSection} />}
                  {currentSection === 2 && <CompetitorsSection projectData={projectData} updateSection={updateSection} />}
                  {currentSection === 3 && <TeamSection projectData={projectData} updateSection={updateSection} />}
                  {currentSection === 4 && <FinancialsSection projectData={projectData} updateSection={updateSection} />}
                </div>

                <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-700">
                  <button
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                    <span>Назад</span>
                  </button>
                  <div className="flex space-x-4">
                    <button
                      onClick={exportData}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <Download size={20} />
                      <span>Экспорт</span>
                    </button>
                    {currentSection === sections.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || getTotalCompletion() < 50}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-900 font-semibold rounded-lg hover:from-emerald-600 hover:to-lime-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                            <span>Анализируем...</span>
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            <span>Отправить заявку</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-900 font-semibold rounded-lg hover:from-emerald-600 hover:to-lime-500 transition-all duration-200"
                      >
                        <span>Далее</span>
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- КОМПОНЕНТЫ СЕКЦИЙ (ФОРМЫ) ---

const OverviewSection: React.FC<{
  projectData: ProjectData;
  updateSection: (section: keyof ProjectData, field: string, value: string) => void;
}> = ({ projectData, updateSection }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Название проекта *</label>
      <input
        type="text"
        value={projectData.overview.projectName}
        onChange={(e) => updateSection('overview', 'projectName', e.target.value)}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Введите название вашего проекта"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Описание проекта *</label>
      <textarea
        value={projectData.overview.description}
        onChange={(e) => updateSection('overview', 'description', e.target.value)}
        rows={4}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Опишите ваш проект, его цель и ключевые особенности..."
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-emerald-200 mb-2">Категория</label>
        <select
          value={projectData.overview.category}
          onChange={(e) => updateSection('overview', 'category', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Выберите категорию</option>
          <option value="fintech">FinTech</option>
          <option value="healthtech">HealthTech</option>
          <option value="edtech">EdTech</option>
          <option value="ecommerce">E-commerce</option>
          <option value="saas">SaaS</option>
          <option value="ai">AI/ML</option>
          <option value="blockchain">Blockchain</option>
          <option value="iot">IoT</option>
          <option value="greentech">GreenTech</option>
          <option value="other">Другое</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-emerald-200 mb-2">Текущая стадия</label>
        <select
          value={projectData.overview.stage}
          onChange={(e) => updateSection('overview', 'stage', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Выберите стадию</option>
          <option value="idea">Стадия идеи</option>
          <option value="prototype">Прототип</option>
          <option value="mvp">MVP</option>
          <option value="early">Ранняя стадия</option>
          <option value="growth">Стадия роста</option>
          <option value="scale">Стадия масштабирования</option>
        </select>
      </div>
    </div>
  </div>
);

const BusinessModelSection: React.FC<{
  projectData: ProjectData;
  updateSection: (section: keyof ProjectData, field: string, value: string) => void;
}> = ({ projectData, updateSection }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Источники дохода *</label>
      <textarea
        value={projectData.businessModel.revenueStreams}
        onChange={(e) => updateSection('businessModel', 'revenueStreams', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Опишите, как ваш проект будет генерировать доходы..."
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Целевой рынок *</label>
      <textarea
        value={projectData.businessModel.targetMarket}
        onChange={(e) => updateSection('businessModel', 'targetMarket', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Определите вашу целевую аудиторию и рыночные сегменты..."
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Ценностное предложение *</label>
      <textarea
        value={projectData.businessModel.valueProposition}
        onChange={(e) => updateSection('businessModel', 'valueProposition', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Какую уникальную ценность предоставляет ваш проект?"
      />
    </div>
  </div>
);

const CompetitorsSection: React.FC<{
  projectData: ProjectData;
  updateSection: (section: keyof ProjectData, field: string, value: string) => void;
}> = ({ projectData, updateSection }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Основные конкуренты *</label>
      <textarea
        value={projectData.competitors.mainCompetitors}
        onChange={(e) => updateSection('competitors', 'mainCompetitors', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Перечислите и опишите ваших основных конкурентов..."
      />
    </div>
  </div>
);

const TeamSection: React.FC<{
  projectData: ProjectData;
  updateSection: (section: keyof ProjectData, field: string, value: string) => void;
}> = ({ projectData, updateSection }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Основатели *</label>
      <textarea
        value={projectData.team.founders}
        onChange={(e) => updateSection('team', 'founders', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Опишите команду основателей и их опыт..."
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-emerald-200 mb-2">Размер команды</label>
        <input
          type="text"
          value={projectData.team.teamSize}
          onChange={(e) => updateSection('team', 'teamSize', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          placeholder="например, 5 полный день, 3 частично"
        />
      </div>
    </div>
  </div>
);

const FinancialsSection: React.FC<{
  projectData: ProjectData;
  updateSection: (section: keyof ProjectData, field: string, value: string) => void;
}> = ({ projectData, updateSection }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-emerald-200 mb-2">Необходимое финансирование</label>
        <input
          type="text"
          value={projectData.financials.fundingNeeded}
          onChange={(e) => updateSection('financials', 'fundingNeeded', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          placeholder="например, $500K, $2M"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-emerald-200 mb-2">Текущий доход</label>
        <input
          type="text"
          value={projectData.financials.currentRevenue}
          onChange={(e) => updateSection('financials', 'currentRevenue', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          placeholder="например, $50K MRR, $0 (до-доходный)"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-emerald-200 mb-2">Прогнозируемый доход</label>
      <textarea
        value={projectData.financials.projectedRevenue}
        onChange={(e) => updateSection('financials', 'projectedRevenue', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        placeholder="Предоставьте прогнозы доходов на следующие 3-5 лет..."
      />
    </div>
  </div>
);


// --- КОМПОНЕНТ СТРАНИЦЫ РЕЗУЛЬТАТОВ ---

interface ResultsPageProps {
  projectData: ProjectData;
  apiResponse: ApiResponse | null;
  onBack: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ projectData, apiResponse, onBack }) => {
  const analogs = apiResponse?.analogs || [];
  
  // Состояние для грантов
  const [grantRecommendations, setGrantRecommendations] = useState<Grant[] | null>(null);
  const [isFetchingGrants, setIsFetchingGrants] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  // Функция для запроса грантов
  const handleFetchGrants = async () => {
    setIsFetchingGrants(true);
    setGrantError(null);
    const apiData = {
      businessModel: projectData.businessModel,
      competitors: projectData.competitors,
      financials: projectData.financials,
      overview: projectData.overview,
      team: projectData.team
    };

    try {
      const response = await axios.post<GrantApiResponse>('https://45.151.30.224.sslip.io/api/microgrants', apiData);
      setGrantRecommendations(response.data.grants);
    } catch (error) {
      console.error('Error fetching grants:', error);
      setGrantError('Не удалось загрузить рекомендации по грантам. Попробуйте снова.');
    } finally {
      setIsFetchingGrants(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Результаты анализа
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Похожие стартапы и комплексное сравнение рынка для "{projectData.overview.projectName}"
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Назад к заявке</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/40 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Building2 className="mr-3 text-emerald-400" />
              Краткое описание вашего проекта
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-200 mb-2">Детали проекта</h3>
                <p className="text-slate-300 mb-2"><strong>Категория:</strong> {projectData.overview.category}</p>
                <p className="text-slate-300 mb-2"><strong>Стадия:</strong> {projectData.overview.stage}</p>
                <p className="text-slate-300"><strong>Описание:</strong> {projectData.overview.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-200 mb-2">Бизнес-модель</h3>
                <p className="text-slate-300 mb-2"><strong>Доходы:</strong> {projectData.businessModel.revenueStreams}</p>
                <p className="text-slate-300"><strong>Целевой рынок:</strong> {projectData.businessModel.targetMarket}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Похожие стартапы</h2>
          {analogs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {analogs.map((startup, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{startup.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-emerald-400">{startup.similarity}% Совпадение</div>
                      <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full"
                          style={{ width: `${startup.similarity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-4">{startup.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2"><Target size={16} className="text-emerald-400" /><span className="text-sm text-slate-300"><strong>Бизнес-модель:</strong> {startup.businessModel}</span></div>
                    <div className="flex items-center space-x-2"><DollarSign size={16} className="text-emerald-400" /><span className="text-sm text-slate-300"><strong>Финансирование:</strong> {startup.funding}</span></div>
                    <div className="flex items-center space-x-2"><TrendingUp size={16} className="text-emerald-400" /><span className="text-sm text-slate-300"><strong>Стадия:</strong> {startup.stage}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-200 mb-2">Сильные стороны</h4>
                        <ul className="text-xs text-slate-300 space-y-1">{startup.strengths.map((strength, i) => (<li key={i} className="flex items-start space-x-2"><div className="w-1 h-1 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div><span>{strength}</span></li>))}</ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-300 mb-2">Вызовы</h4>
                        <ul className="text-xs text-slate-300 space-y-1">{startup.weaknesses.map((weakness, i) => (<li key={i} className="flex items-start space-x-2"><div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div><span>{weakness}</span></li>))}</ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700"><p className="text-sm text-slate-300"><strong className="text-emerald-200">Позиция на рынке:</strong> {startup.marketPosition}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400">Похожие стартапы не найдены.</p>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-emerald-500/10 to-lime-400/10 border border-emerald-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Рекомендуемые следующие шаги</h2>
            {apiResponse?.recommendations && apiResponse.recommendations.length > 0 ? (
              <div className="space-y-4">
                {apiResponse.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${index % 2 === 0 ? 'bg-emerald-500 text-white' : 'bg-lime-400 text-slate-900'}`}>
                      {index + 1}
                    </div>
                    <div><p className="text-slate-300">{recommendation}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Рекомендации по следующим шагам не найдены.</p>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          {grantRecommendations === null && (
            <div className="text-center">
              <button
                onClick={handleFetchGrants}
                disabled={isFetchingGrants}
                className="flex items-center justify-center mx-auto space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingGrants ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Ищем гранты...</span>
                  </>
                ) : (
                  <>
                    <Award size={20} />
                    <span>Получить рекомендации по грантам</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {grantError && <p className="text-center text-red-400 mt-4">{grantError}</p>}
          
          {grantRecommendations !== null && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Award className="mr-3 text-cyan-400" />
                Рекомендации по грантам
              </h2>
              {grantRecommendations.length > 0 ? (
                <div className="space-y-6">
                  {grantRecommendations.map((grant, index) => (
                    <div key={index} className="p-4 border-l-4 border-cyan-500 bg-slate-900/50 rounded-r-lg">
                      <h3 className="font-semibold text-lg text-cyan-200 mb-1">{grant.name}</h3>
                      <p className="text-sm text-slate-300">{grant.why}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Подходящих грантов не найдено.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
