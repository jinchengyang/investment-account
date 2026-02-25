import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowLeft,
  Settings,
  Share2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatCurrency, formatPercent } from './lib/utils';
import { Account, Summary, HistoryPoint, Transaction } from './types';

// --- Components ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className, onClick }: CardProps) => (
  <div 
    onClick={onClick}
    className={cn("bg-white rounded-2xl p-5 shadow-sm border border-black/5", className)}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className, disabled }: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
  className?: string,
  disabled?: boolean
}) => {
  const variants = {
    primary: "bg-[#0ea5e9] text-white hover:bg-[#0284c7]",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:bg-gray-100"
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn("px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50", variants[variant], className)}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        <div className="p-5 border-bottom flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Plus className="w-6 h-6 rotate-45 text-gray-400" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [showAssets, setShowAssets] = useState(true);
  const [view, setView] = useState<'dashboard' | 'summary' | 'account_detail'>('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateType, setUpdateType] = useState<'flow' | 'no_flow' | null>(null);
  const [flowType, setFlowType] = useState<'deposit' | 'withdrawal'>('deposit');
  
  // Form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState('CNY');
  const [newAccBalance, setNewAccBalance] = useState('');
  
  const [updateBalance, setUpdateBalance] = useState('');
  const [updateFlowAmount, setUpdateFlowAmount] = useState('');
  const [updateNote, setUpdateNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, sumRes, histRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/summary'),
        fetch('/api/history')
      ]);
      setAccounts(await accRes.json());
      setSummary(await sumRes.json());
      setHistory(await histRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccName || !newAccBalance) return;
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAccName,
        currency: newAccCurrency,
        initial_balance: parseFloat(newAccBalance)
      })
    });
    setIsAddModalOpen(false);
    setNewAccName('');
    setNewAccBalance('');
    fetchData();
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount || !updateBalance) return;
    
    const amount = updateType === 'flow' ? parseFloat(updateFlowAmount) : 0;
    const type = updateType === 'flow' ? flowType : 'market_update';
    
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: selectedAccount.id,
        type,
        amount: flowType === 'withdrawal' ? -amount : amount,
        balance_after: parseFloat(updateBalance),
        date: new Date().toISOString().split('T')[0],
        note: updateNote
      })
    });
    
    setIsUpdateModalOpen(false);
    setUpdateType(null);
    setUpdateBalance('');
    setUpdateFlowAmount('');
    setUpdateNote('');
    fetchData();
  };

  const renderDashboard = () => (
    <div className="space-y-6 pb-24">
      {/* Summary Card */}
      <Card 
        onClick={() => setView('summary')}
        className="bg-gradient-to-br from-slate-50 to-white cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <span>默认汇总 (元)</span>
            <button onClick={(e) => { e.stopPropagation(); setShowAssets(!showAssets); }}>
              {showAssets ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
        
        <div className="text-3xl font-bold tracking-tight mb-6">
          {showAssets ? (summary ? formatCurrency(summary.totalAssets, 'CNY') : '---') : '******'}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">累计收益 (元)</div>
            <div className={cn("text-lg font-semibold", (summary?.cumulativeProfit || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}>
              {showAssets ? (summary ? formatCurrency(summary.cumulativeProfit, 'CNY') : '---') : '***'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">年化收益率</div>
            <div className={cn("text-lg font-semibold", (summary?.annualizedReturn || 0) >= 0 ? "text-rose-500" : "text-emerald-500")}>
              {showAssets ? (summary ? formatPercent(summary.annualizedReturn) : '---') : '***'}
            </div>
          </div>
        </div>
      </Card>

      {/* Account List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1 font-bold text-gray-800">
            全部资产 <Plus className="w-4 h-4 rotate-45" />
          </div>
          <button className="p-2 text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {accounts.map(account => (
            <div key={account.id}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{account.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">7天前更新</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-xs py-1.5 px-3 rounded-full border-gray-200"
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    更新收益
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-0.5">资产 ({account.currency})</div>
                    <div className="text-sm font-bold text-gray-800">{formatCurrency(account.current_balance, account.currency)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 mb-0.5">累计收益</div>
                    <div className="text-sm font-bold text-rose-500">+799,880.02</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 mb-0.5">年化收益率</div>
                    <div className="text-sm font-bold text-rose-500">+12.41%</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5" /> 添加投资资产
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center gap-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <Share2 className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      <div className="px-1">
        <h2 className="text-sm text-gray-500 mb-1">汇总 / <span className="text-gray-900 font-bold">默认汇总</span></h2>
      </div>

      <Card className="bg-white">
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          总资产 (元) <Eye className="w-3 h-3" />
        </div>
        <div className="text-3xl font-bold mb-6">{summary ? formatCurrency(summary.totalAssets, 'CNY') : '---'}</div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-gray-400 mb-1">累计收益 (元)</div>
            <div className="text-sm font-bold text-rose-500">{summary ? formatCurrency(summary.cumulativeProfit, 'CNY') : '---'}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-0.5">
              时间加权收益率 <HelpCircle className="w-2.5 h-2.5" />
            </div>
            <div className="text-sm font-bold text-rose-500">{summary ? formatPercent(summary.timeWeightedReturn) : '---'}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-0.5">
              年化收益率 <HelpCircle className="w-2.5 h-2.5" />
            </div>
            <div className="text-sm font-bold text-rose-500">{summary ? formatPercent(summary.annualizedReturn) : '---'}</div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b">
          <button className="flex-1 py-3 text-sm font-bold border-b-2 border-[#0ea5e9] text-[#0ea5e9]">收益率曲线</button>
          <button className="flex-1 py-3 text-sm font-medium text-gray-400">累计收益曲线</button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6 text-[10px]">
            <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-[#0ea5e9]"></div> 时间加权收益率</div>
            <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-purple-500"></div> 沪深 300 全收益</div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999' }}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-6 bg-gray-50 rounded-xl p-1">
            {['今年', '近1年', '记账以来', '未来', '自定义'].map(label => (
              <button 
                key={label}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-colors",
                  label === '记账以来' ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-gray-900">年度收益对比</h3>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] text-gray-400 text-left">
                <th className="p-4 font-medium">时间</th>
                <th className="p-4 font-medium">时间加权收益率</th>
                <th className="p-4 font-medium">沪深 300 全收益</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium">年化</td>
                <td className="p-4 font-bold text-rose-500">+2.83%</td>
                <td className="p-4 font-bold text-rose-500">+9.02%</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">2025年</td>
                <td className="p-4 font-bold text-rose-500">+15.74%</td>
                <td className="p-4 font-bold text-rose-500">+20.98%</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-100">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-10" /> {/* Spacer */}
          <h1 className="text-lg font-bold">投资记账</h1>
          <button className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <Calendar className="w-4 h-4" /> 记账提醒
          </button>
        </div>

        {view === 'dashboard' && renderDashboard()}
        {view === 'summary' && renderSummary()}

        {/* Add Account Modal */}
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          title="添加投资资产"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">账户名称</label>
              <input 
                type="text" 
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="如：港股账号、人民币账户"
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-sky-500 text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">币种</label>
              <select 
                value={newAccCurrency}
                onChange={(e) => setNewAccCurrency(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-sky-500 text-gray-900 font-medium"
              >
                <option value="CNY">人民币 (CNY)</option>
                <option value="HKD">港元 (HKD)</option>
                <option value="USD">美元 (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">初始资产金额</label>
              <input 
                type="number" 
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                placeholder="0.00"
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-sky-500 text-gray-900 font-medium"
              />
            </div>
            <Button onClick={handleAddAccount} className="w-full py-4 rounded-2xl text-lg mt-4">确定添加</Button>
          </div>
        </Modal>

        {/* Update Selection Modal */}
        <Modal 
          isOpen={isUpdateModalOpen && !updateType} 
          onClose={() => setIsUpdateModalOpen(false)} 
          title="更新收益"
        >
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400">上次更新资产 (2月18日) 至今，是否有未记录的资金进出？</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setUpdateType('flow')}
              className="p-6 bg-sky-50 rounded-3xl flex flex-col items-center gap-4 group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">有资金进出</div>
                <div className="text-[10px] text-sky-600 font-medium mt-1">记录投入 / 转出</div>
              </div>
            </button>
            <button 
              onClick={() => setUpdateType('no_flow')}
              className="p-6 bg-orange-50 rounded-3xl flex flex-col items-center gap-4 group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">没有资金进出</div>
                <div className="text-[10px] text-orange-600 font-medium mt-1">只更新新资金金额</div>
              </div>
            </button>
          </div>
        </Modal>

        {/* Detailed Update Modal */}
        <Modal 
          isOpen={isUpdateModalOpen && !!updateType} 
          onClose={() => { setIsUpdateModalOpen(false); setUpdateType(null); }} 
          title="更新收益"
        >
          <div className="space-y-6">
            {updateType === 'flow' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-sm mb-4">
                  <ArrowUpRight className="w-4 h-4" /> 资金进出
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">类型</span>
                    <div className="flex bg-white p-1 rounded-lg shadow-sm">
                      <button 
                        onClick={() => setFlowType('deposit')}
                        className={cn("px-4 py-1 rounded-md text-xs font-bold transition-colors", flowType === 'deposit' ? "bg-sky-500 text-white" : "text-gray-400")}
                      >
                        投入
                      </button>
                      <button 
                        onClick={() => setFlowType('withdrawal')}
                        className={cn("px-4 py-1 rounded-md text-xs font-bold transition-colors", flowType === 'withdrawal' ? "bg-sky-500 text-white" : "text-gray-400")}
                      >
                        转出
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{flowType === 'deposit' ? '投入' : '转出'}金额</span>
                    <input 
                      type="number" 
                      value={updateFlowAmount}
                      onChange={(e) => setUpdateFlowAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent border-none text-right font-bold text-gray-900 focus:ring-0 p-0 w-32"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-4">
                <Wallet className="w-4 h-4" /> 当前资产金额
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">日期</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" /> 02/25(今天)
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">资产金额</span>
                  <div className="text-right">
                    <input 
                      type="number" 
                      value={updateBalance}
                      onChange={(e) => setUpdateBalance(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent border-none text-right font-bold text-gray-900 focus:ring-0 p-0 w-32"
                    />
                    <div className="text-[10px] text-gray-400 mt-1">上次记录: {selectedAccount ? formatCurrency(selectedAccount.current_balance, selectedAccount.currency) : '---'}</div>
                  </div>
                </div>
              </div>

              <div>
                <textarea 
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="填写备注"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-sky-500 text-sm min-h-[100px]"
                />
              </div>
            </div>

            <Button onClick={handleUpdateAccount} className="w-full py-4 rounded-2xl text-lg">完成</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

