import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, BarChart2, Utensils, Bus, ShoppingBag, Film, MoreHorizontal, X, Home, Heart, BookOpen, Banknote, Gift, TrendingUp, Briefcase, Trash2, Edit2, Delete, Wallet, CreditCard, Smartphone, BanknoteIcon, Settings, ChevronRight } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'Utensils', color: '#FF6B6B' },
  { id: 'transport', name: '交通', icon: 'Bus', color: '#4ECDC4' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#45B7D1' },
  { id: 'entertainment', name: '娱乐', icon: 'Film', color: '#96CEB4' },
  { id: 'housing', name: '居住', icon: 'Home', color: '#FFA940' },
  { id: 'medical', name: '医疗', icon: 'Heart', color: '#FF7875' },
  { id: 'education', name: '教育', icon: 'BookOpen', color: '#9254DE' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: '#DDA0DD' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', icon: 'Banknote', color: '#52C41A' },
  { id: 'bonus', name: '奖金', icon: 'Gift', color: '#73D13D' },
  { id: 'investment', name: '投资', icon: 'TrendingUp', color: '#95DE64' },
  { id: 'parttime', name: '兼职', icon: 'Briefcase', color: '#B7EB8F' },
  { id: 'other_income', name: '其他', icon: 'MoreHorizontal', color: '#D9F7BE' },
];

const CATEGORY_DEFAULT_NOTES = {
  food: '餐饮支出',
  transport: '交通支出',
  shopping: '购物支出',
  entertainment: '娱乐支出',
  housing: '居住支出',
  medical: '医疗支出',
  education: '教育支出',
  other: '其他支出',
  salary: '工资收入',
  bonus: '奖金收入',
  investment: '投资收入',
  parttime: '兼职收入',
  other_income: '其他收入',
};

const DEFAULT_ACCOUNTS = [
  { id: 'wechat', name: '微信', icon: 'Smartphone', color: '#07C160' },
  { id: 'alipay', name: '支付宝', icon: 'CreditCard', color: '#1677FF' },
  { id: 'bank', name: '银行卡', icon: 'BanknoteIcon', color: '#FF6B6B' },
  { id: 'cash', name: '现金', icon: 'Wallet', color: '#FFA940' },
];

// Create Context
const ExpenseContext = createContext(null);

// Provider Component
function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('budget');
    return saved ? parseFloat(saved) : 5000;
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget', budget.toString());
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addExpense = (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const editExpense = (id, updatedExpense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e))
    );
  };

  const updateBudget = (newBudget) => {
    setBudget(newBudget);
  };

  const addAccount = (account) => {
    setAccounts((prev) => [...prev, { ...account, id: Date.now().toString() }]);
  };

  const deleteAccount = (id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const getMonthlyTotal = (year, month) => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getMonthlyExpense = (year, month) => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month && e.type !== 'income';
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getRecentExpenses = (limit = 5) => {
    return expenses.slice(0, limit);
  };

  const getCategoryBreakdown = (year, month) => {
    const monthlyExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && e.type !== 'income';
    });

    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (total === 0) {
      return EXPENSE_CATEGORIES.map((cat) => ({ category: cat.id, amount: 0, percentage: 0 }));
    }

    return EXPENSE_CATEGORIES.map((cat) => {
      const catTotal = monthlyExpenses
        .filter((e) => e.category === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        category: cat.id,
        amount: catTotal,
        percentage: (catTotal / total) * 100,
      };
    });
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      budget,
      accounts,
      addExpense, 
      deleteExpense, 
      editExpense, 
      updateBudget,
      addAccount,
      deleteAccount,
      getMonthlyTotal, 
      getMonthlyExpense,
      getRecentExpenses, 
      getCategoryBreakdown 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

// Custom hook to use the context
function useExpenseStore() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseStore must be used within ExpenseProvider');
  }
  return context;
}

function CategoryIcon({ categoryId, type = 'expense', size = 20 }) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find((c) => c.id === categoryId) || categories[categories.length - 1];
  const IconComponent = {
    Utensils, Bus, ShoppingBag, Film, MoreHorizontal, Home, Heart, BookOpen, Banknote, Gift, TrendingUp, Briefcase,
  }[category.icon] || MoreHorizontal;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 8, height: size + 8, borderRadius: 8, backgroundColor: `${category.color}20` }}>
      <IconComponent size={size} color={category.color} />
    </span>
  );
}

function AccountIcon({ accountId, size = 20 }) {
  const { accounts } = useExpenseStore();
  const account = accounts.find((a) => a.id === accountId) || accounts[0];
  const IconComponent = {
    Smartphone, CreditCard, BanknoteIcon, Wallet,
  }[account?.icon] || Wallet;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 8, height: size + 8, borderRadius: 8, backgroundColor: `${account?.color || '#999'}20` }}>
      <IconComponent size={size} color={account?.color || '#999'} />
    </span>
  );
}

// Custom Number Pad Component
function NumberPad({ value, onChange, onComplete }) {
  const handleNumber = (num) => {
    if (value === '0' && num !== '.') {
      onChange(num);
    } else if (num === '.') {
      if (!value.includes('.')) {
        onChange(value + num);
      }
    } else {
      const parts = (value + num).split('.');
      if (parts[1] && parts[1].length > 2) return;
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1) || '0');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'del'],
  ];

  return (
    <div style={styles.numberPad}>
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} style={styles.numberPadRow}>
          {row.map((key) => (
            <button
              key={key}
              style={styles.numberPadKey}
              onClick={() => {
                if (key === 'del') {
                  handleDelete();
                } else {
                  handleNumber(key);
                }
              }}
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>
      ))}
      <button style={styles.numberPadComplete} onClick={onComplete}>
        完成
      </button>
    </div>
  );
}

// Budget Progress Component
function BudgetProgress({ spent, budget }) {
  const percentage = Math.min((spent / budget) * 100, 100);
  let progressColor = '#52C41A';
  if (percentage > 80) progressColor = '#FAAD14';
  if (percentage >= 100) progressColor = '#FF4D4F';

  return (
    <div style={styles.budgetContainer}>
      <div style={styles.budgetHeader}>
        <span style={styles.budgetLabel}>本月预算</span>
        <span style={styles.budgetText}>¥{spent.toFixed(2)} / ¥{budget.toFixed(2)}</span>
      </div>
      <div style={styles.progressBarContainer}>
        <div style={{...styles.progressBar, width: `${percentage}%`, backgroundColor: progressColor}} />
      </div>
      <div style={styles.budgetFooter}>
        <span style={{...styles.budgetPercentage, color: progressColor}}>
          {percentage.toFixed(1)}%
        </span>
        <span style={styles.budgetRemaining}>
          剩余: ¥{Math.max(budget - spent, 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// Swipeable Expense Card Component
function SwipeableExpenseCard({ expense, onDelete, onEdit }) {
  const [translateX, setTranslateX] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const categories = expense.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find((c) => c.id === expense.category) || categories[categories.length - 1];

  const formatCurrency = (amount) => `¥${amount.toFixed(2)}`;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) return '今天';
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return '昨天';
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    
    const diff = e.touches[0].clientX - startX.current;
    let newTranslateX = currentX.current + diff;
    
    if (newTranslateX > 80) newTranslateX = 80;
    if (newTranslateX < -80) newTranslateX = -80;
    
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    
    if (translateX > 40) {
      setTranslateX(80);
    } else if (translateX < -40) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(expense.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div style={styles.swipeableContainer}>
        <div style={styles.swipeBackground}>
          <button 
            style={{...styles.swipeAction, ...styles.swipeActionEdit}}
            onClick={() => {
              onEdit(expense);
              setTranslateX(0);
            }}
          >
            <Edit2 size={20} color="white" />
            <span style={styles.swipeActionText}>编辑</span>
          </button>
          <button 
            style={{...styles.swipeAction, ...styles.swipeActionDelete}}
            onClick={handleDelete}
          >
            <Trash2 size={20} color="white" />
            <span style={styles.swipeActionText}>删除</span>
          </button>
        </div>
        
        <div
          style={{...styles.expenseItem, transform: `translateX(${translateX}px)`, transition: isDragging.current ? 'none' : 'transform 0.3s ease'}}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => {
            startX.current = e.clientX;
            currentX.current = translateX;
            isDragging.current = true;
          }}
          onMouseMove={(e) => {
            if (!isDragging.current) return;
            const diff = e.clientX - startX.current;
            let newTranslateX = currentX.current + diff;
            if (newTranslateX > 80) newTranslateX = 80;
            if (newTranslateX < -80) newTranslateX = -80;
            setTranslateX(newTranslateX);
          }}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <div style={styles.expenseLeft}>
            <CategoryIcon categoryId={expense.category} type={expense.type} size={24} />
            <div style={styles.expenseInfo}>
              <p style={styles.expenseCategory}>{category.name}</p>
              <p style={styles.expenseDetail}>
                {formatDate(expense.date)}
                {expense.note && ` · ${expense.note}`}
                {expense.accountId && ` · ${getAccountName(expense.accountId)}`}
              </p>
            </div>
          </div>
          <span style={{...styles.expenseAmount, color: expense.type === 'income' ? '#52C41A' : '#FF6B6B'}}>
            {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
          </span>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>确认删除</h3>
            <p style={styles.confirmText}>确定要删除这条记录吗？此操作不可撤销。</p>
            <div style={styles.confirmButtons}>
              <button style={styles.confirmCancel} onClick={() => setShowDeleteConfirm(false)}>
                取消
              </button>
              <button style={styles.confirmDelete} onClick={confirmDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getAccountName(accountId) {
  const account = DEFAULT_ACCOUNTS.find(a => a.id === accountId);
  return account?.name || '';
}

function HomePage() {
  const { expenses, budget, getMonthlyExpense, getRecentExpenses, deleteExpense } = useExpenseStore();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthlyExpense = getMonthlyExpense(currentYear, currentMonth);
  const recentExpenses = getRecentExpenses(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const formatCurrency = (amount) => `¥${amount.toFixed(2)}`;

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingExpense(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>EasyBill</h1>
        <div style={styles.headerButtons}>
          <Link to="/accounts" style={styles.headerButton}>
            <Wallet size={22} color="#1890FF" />
          </Link>
          <Link to="/statistics" style={styles.headerButton}>
            <BarChart2 size={22} color="#1890FF" />
          </Link>
        </div>
      </header>

      <div style={styles.summaryCard}>
        <div style={styles.summaryHeader}>
          <div>
            <p style={styles.summaryLabel}>{currentYear}年{currentMonth + 1}月总支出</p>
            <p style={styles.totalAmount}>{formatCurrency(monthlyExpense)}</p>
          </div>
          <button 
            style={styles.budgetSettingButton}
            onClick={() => setShowBudgetModal(true)}
          >
            <Settings size={16} />
            设置预算
          </button>
        </div>
        
        <BudgetProgress spent={monthlyExpense} budget={budget} />
        
        <p style={styles.recordCount}>
          本月记账 {expenses.filter((e) => {
            const d = new Date(e.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          }).length} 笔
        </p>
      </div>

      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>最近记录</h2>
        {recentExpenses.length > 0 && (
          <Link to="/statistics" style={styles.viewAllLink}>
            查看全部 →
          </Link>
        )}
      </div>

      {recentExpenses.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>还没有记账记录</p>
          <p style={styles.emptyHint}>点击下方按钮开始记账吧</p>
        </div>
      ) : (
        <div style={styles.expenseList}>
          {recentExpenses.map((expense) => (
            <SwipeableExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={deleteExpense}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <button style={styles.fab} onClick={() => setShowAddModal(true)}>
        <Plus size={28} color="white" />
      </button>

      {showAddModal && (
        <AddExpenseModal 
          onClose={handleCloseModal} 
          editingExpense={editingExpense}
        />
      )}

      {showBudgetModal && (
        <BudgetModal 
          onClose={() => setShowBudgetModal(false)} 
        />
      )}
    </div>
  );
}

function BudgetModal({ onClose }) {
  const { budget, updateBudget } = useExpenseStore();
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [showNumberPad, setShowNumberPad] = useState(false);

  const handleSave = () => {
    const budgetValue = parseFloat(newBudget);
    if (!isNaN(budgetValue) && budgetValue > 0) {
      updateBudget(budgetValue);
      onClose();
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>设置预算</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} color="#666" />
          </button>
        </div>

        <div style={styles.amountSection}>
          <p style={styles.amountLabel}>本月预算金额</p>
          <p style={styles.amountDisplay}>¥{newBudget}</p>
          <div 
            style={styles.amountInput}
            onClick={() => setShowNumberPad(true)}
          >
            点击修改预算
          </div>
        </div>

        <button
          style={styles.submitButton}
          onClick={handleSave}
        >
          保存预算
        </button>
      </div>

      {showNumberPad && (
        <div style={styles.numberPadOverlay} onClick={() => setShowNumberPad(false)}>
          <div style={styles.numberPadContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.numberPadHeader}>
              <span style={styles.numberPadAmount}>¥{newBudget}</span>
            </div>
            <NumberPad
              value={newBudget}
              onChange={setNewBudget}
              onComplete={() => setShowNumberPad(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddExpenseModal({ onClose, editingExpense }) {
  const { addExpense, editExpense, accounts } = useExpenseStore();
  const isEditing = !!editingExpense;
  
  const [amount, setAmount] = useState(isEditing ? editingExpense.amount.toString() : '0');
  const [type, setType] = useState(isEditing ? editingExpense.type : 'expense');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (isEditing) {
      const cats = editingExpense.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return cats.find(c => c.id === editingExpense.category) || cats[0];
    }
    return EXPENSE_CATEGORIES[0];
  });
  const [selectedAccount, setSelectedAccount] = useState(() => {
    if (isEditing && editingExpense.accountId) {
      return accounts.find(a => a.id === editingExpense.accountId) || accounts[0];
    }
    return accounts[0];
  });
  const [note, setNote] = useState(isEditing ? editingExpense.note : '');
  const [showNumberPad, setShowNumberPad] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setSelectedCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [type, isEditing]);

  const handleSubmit = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return;

    const finalNote = note.trim() || CATEGORY_DEFAULT_NOTES[selectedCategory.id] || '';

    const expenseData = {
      amount: amountValue,
      category: selectedCategory.id,
      note: finalNote,
      type: type,
      accountId: selectedAccount.id,
    };

    if (isEditing) {
      editExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }

    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{...styles.modalContent, maxHeight: '95vh'}} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{isEditing ? '编辑记录' : '记一笔'}</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} color="#666" />
          </button>
        </div>

        <div style={styles.typeSelector}>
          <button
            style={{
              ...styles.typeButton,
              backgroundColor: type === 'expense' ? '#FF6B6B' : '#f5f5f5',
              color: type === 'expense' ? 'white' : '#666',
            }}
            onClick={() => setType('expense')}
          >
            支出
          </button>
          <button
            style={{
              ...styles.typeButton,
              backgroundColor: type === 'income' ? '#52C41A' : '#f5f5f5',
              color: type === 'income' ? 'white' : '#666',
            }}
            onClick={() => setType('income')}
          >
            收入
          </button>
        </div>

        <div style={styles.amountSection}>
          <p style={styles.amountLabel}>{type === 'expense' ? '支出' : '收入'}金额</p>
          <p style={{...styles.amountDisplay, color: type === 'expense' ? '#1890FF' : '#52C41A'}}>
            ¥{amount}
          </p>
          <div 
            style={styles.amountInput}
            onClick={() => setShowNumberPad(true)}
          >
            点击输入金额
          </div>
        </div>

        <div style={styles.categorySection}>
          <p style={styles.categoryLabel}>选择分类</p>
          <div style={styles.categoryGrid}>
            {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
              <button
                key={cat.id}
                style={{
                  ...styles.categoryButton,
                  backgroundColor: selectedCategory.id === cat.id ? `${cat.color}20` : '#f5f5f5',
                  borderColor: selectedCategory.id === cat.id ? cat.color : 'transparent',
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                <div style={{
                  ...styles.categoryIcon,
                  backgroundColor: `${cat.color}20`,
                }}>
                  <CategoryIcon categoryId={cat.id} type={type} size={20} />
                </div>
                <span style={{
                  ...styles.categoryName,
                  color: selectedCategory.id === cat.id ? '#333' : '#666',
                }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.categorySection}>
          <p style={styles.categoryLabel}>选择账户</p>
          <div style={styles.accountGrid}>
            {accounts.map((account) => (
              <button
                key={account.id}
                style={{
                  ...styles.accountButton,
                  backgroundColor: selectedAccount.id === account.id ? `${account.color}20` : '#f5f5f5',
                  borderColor: selectedAccount.id === account.id ? account.color : 'transparent',
                }}
                onClick={() => setSelectedAccount(account)}
              >
                <AccountIcon accountId={account.id} size={20} />
                <span style={{
                  ...styles.accountName,
                  color: selectedAccount.id === account.id ? '#333' : '#666',
                }}>{account.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.noteSection}>
          <p style={styles.noteLabel}>添加备注</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`默认: ${CATEGORY_DEFAULT_NOTES[selectedCategory.id] || ''}`}
            style={styles.noteInput}
            rows={2}
          />
        </div>

        <button
          style={{
            ...styles.submitButton,
            opacity: parseFloat(amount) <= 0 ? 0.5 : 1,
          }}
          onClick={handleSubmit}
          disabled={parseFloat(amount) <= 0}
        >
          {isEditing ? '保存修改' : '保存记录'}
        </button>
      </div>

      {showNumberPad && (
        <div style={styles.numberPadOverlay} onClick={() => setShowNumberPad(false)}>
          <div style={styles.numberPadContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.numberPadHeader}>
              <span style={styles.numberPadAmount}>¥{amount}</span>
            </div>
            <NumberPad
              value={amount}
              onChange={setAmount}
              onComplete={() => setShowNumberPad(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AccountsPage() {
  const { accounts, addAccount, deleteAccount } = useExpenseStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ←
        </button>
        <h1 style={styles.title}>账户管理</h1>
        <button style={styles.addAccountButton} onClick={() => setShowAddModal(true)}>
          <Plus size={20} color="#1890FF" />
        </button>
      </header>

      <div style={styles.accountsList}>
        {accounts.map((account) => (
          <div key={account.id} style={styles.accountCard}>
            <div style={styles.accountLeft}>
              <AccountIcon accountId={account.id} size={28} />
              <span style={styles.accountCardName}>{account.name}</span>
            </div>
            <button 
              style={styles.accountDeleteButton}
              onClick={() => deleteAccount(account.id)}
            >
              <Trash2 size={18} color="#FF6B6B" />
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddAccountModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddAccountModal({ onClose }) {
  const { addAccount, accounts } = useExpenseStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wallet');
  const [selectedColor, setSelectedColor] = useState('#1890FF');

  const iconOptions = [
    { id: 'Wallet', icon: Wallet },
    { id: 'CreditCard', icon: CreditCard },
    { id: 'Smartphone', icon: Smartphone },
    { id: 'BanknoteIcon', icon: BanknoteIcon },
  ];

  const colorOptions = ['#1890FF', '#52C41A', '#FAAD14', '#FF6B6B', '#9254DE', '#13C2C2'];

  const handleSave = () => {
    if (name.trim()) {
      addAccount({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      onClose();
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>添加账户</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} color="#666" />
          </button>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>账户名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：信用卡"
            style={styles.formInput}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>选择图标</label>
          <div style={styles.iconGrid}>
            {iconOptions.map(({ id, icon: Icon }) => (
              <button
                key={id}
                style={{
                  ...styles.iconButton,
                  backgroundColor: selectedIcon === id ? '#1890FF20' : '#f5f5f5',
                  borderColor: selectedIcon === id ? '#1890FF' : 'transparent',
                }}
                onClick={() => setSelectedIcon(id)}
              >
                <Icon size={24} color={selectedIcon === id ? '#1890FF' : '#666'} />
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>选择颜色</label>
          <div style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <button
                key={color}
                style={{
                  ...styles.colorButton,
                  backgroundColor: color,
                  border: selectedColor === color ? '3px solid #333' : '3px solid transparent',
                }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <button
          style={{...styles.submitButton, opacity: !name.trim() ? 0.5 : 1}}
          onClick={handleSave}
          disabled={!name.trim()}
        >
          添加账户
        </button>
      </div>
    </div>
  );
}

function StatisticsPage() {
  const { expenses, getCategoryBreakdown } = useExpenseStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month && e.type !== 'income';
  });
  const monthIncome = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month && e.type === 'income';
  });
  const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncome.reduce((sum, e) => sum + e.amount, 0);
  const breakdown = getCategoryBreakdown(selectedMonth.year, selectedMonth.month);

  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
    });
  }

  const formatCurrency = (amount) => `¥${amount.toFixed(2)}`;

  const pieData = breakdown
    .filter((b) => b.amount > 0)
    .map((b) => {
      const cat = EXPENSE_CATEGORIES.find((c) => c.id === b.category);
      return { name: cat?.name || '其他', amount: b.amount, color: cat?.color || '#DDA0DD' };
    });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backButton}>
          ←
        </Link>
        <h1 style={styles.title}>统计</h1>
      </header>

      <div style={styles.monthSelector}>
        {months.map((m, i) => (
          <button
            key={i}
            style={{
              ...styles.monthButton,
              backgroundColor:
                selectedMonth.year === m.year && selectedMonth.month === m.month
                  ? '#1890FF'
                  : 'white',
              color:
                selectedMonth.year === m.year && selectedMonth.month === m.month
                  ? 'white'
                  : '#333',
            }}
            onClick={() => setSelectedMonth({ year: m.year, month: m.month })}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={styles.summaryCard}>
        <div style={styles.summaryRow}>
          <div style={styles.summaryItem}>
            <p style={styles.summaryLabel}>支出</p>
            <p style={{...styles.totalAmount, color: '#FF6B6B'}}>{formatCurrency(totalExpense)}</p>
          </div>
          <div style={styles.summaryItem}>
            <p style={styles.summaryLabel}>收入</p>
            <p style={{...styles.totalAmount, color: '#52C41A'}}>{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <p style={styles.recordCount}>
          共 {monthExpenses.length + monthIncome.length} 笔记录
        </p>
      </div>

      {pieData.length > 0 ? (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>支出分布</h3>
          <div style={styles.pieChart}>
            <svg viewBox="0 0 100 100" style={styles.pieSvg}>
              {(() => {
                let cumulativePercent = 0;
                return pieData.map((slice, i) => {
                  const percent = (slice.amount / pieData.reduce((s, d) => s + d.amount, 0)) * 100;
                  const startAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;
                  cumulativePercent += percent;
                  const endAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;
                  const x1 = 50 + 40 * Math.cos(startAngle);
                  const y1 = 50 + 40 * Math.sin(startAngle);
                  const x2 = 50 + 40 * Math.cos(endAngle);
                  const y2 = 50 + 40 * Math.sin(endAngle);
                  const largeArcFlag = percent > 50 ? 1 : 0;
                  return (
                    <path
                      key={i}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                });
              })()}
            </svg>
          </div>
          <div style={styles.pieLegend}>
            {pieData.map((slice, i) => (
              <div key={i} style={styles.legendItem}>
                <div style={{ ...styles.legendColor, backgroundColor: slice.color }} />
                <span style={styles.legendLabel}>{slice.name}</span>
                <span style={styles.legendAmount}>{slice.amount.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>该月暂无支出记录</p>
        </div>
      )}

      <div style={styles.detailCard}>
        <h3 style={styles.detailTitle}>分类明细</h3>
        <div style={styles.detailList}>
          {breakdown
            .filter((b) => b.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .map((item) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.id === item.category);
              return (
                <div key={item.category} style={styles.detailItem}>
                  <div style={styles.detailLeft}>
                    <CategoryIcon categoryId={item.category} type="expense" size={24} />
                    <div style={styles.detailInfo}>
                      <p style={styles.detailCategory}>{cat?.name || '其他'}</p>
                      <p style={styles.detailPercent}>{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <span style={styles.detailAmount}>{formatCurrency(item.amount)}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Routes>
      </BrowserRouter>
    </ExpenseProvider>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '24px 16px',
    paddingBottom: '80px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  headerButton: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  backButton: {
    fontSize: '20px',
    color: '#333',
    textDecoration: 'none',
    marginRight: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  budgetSettingButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#666',
    cursor: 'pointer',
  },
  summaryLabel: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '8px',
  },
  totalAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  recordCount: {
    color: '#999',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '12px',
  },
  // Budget Progress Styles
  budgetContainer: {
    marginTop: '8px',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  budgetLabel: {
    fontSize: '12px',
    color: '#999',
  },
  budgetText: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  budgetFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetPercentage: {
    fontSize: '14px',
    fontWeight: '600',
  },
  budgetRemaining: {
    fontSize: '12px',
    color: '#999',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  viewAllLink: {
    color: '#1890FF',
    fontSize: '14px',
    textDecoration: 'none',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyText: {
    color: '#999',
    marginBottom: '8px',
  },
  emptyHint: {
    color: '#999',
    fontSize: '14px',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  swipeableContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 16px',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  swipeAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70px',
    height: '70px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    gap: '4px',
  },
  swipeActionEdit: {
    backgroundColor: '#1890FF',
  },
  swipeActionDelete: {
    backgroundColor: '#FF6B6B',
  },
  swipeActionText: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'grab',
    userSelect: 'none',
  },
  expenseLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  expenseInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  expenseCategory: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '4px',
  },
  expenseDetail: {
    fontSize: '12px',
    color: '#999',
  },
  expenseAmount: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FF6B6B',
  },
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    backgroundColor: '#1890FF',
    border: 'none',
    boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  confirmContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '80%',
    maxWidth: '300px',
    textAlign: 'center',
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  confirmText: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '14px',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
  },
  confirmCancel: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  confirmDelete: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#FF6B6B',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    margin: '16px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  typeSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  typeButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  amountSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  amountLabel: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '8px',
  },
  amountDisplay: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#1890FF',
    marginBottom: '8px',
  },
  amountInput: {
    width: '100%',
    fontSize: '16px',
    textAlign: 'center',
    border: '2px dashed #ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    padding: '12px',
    outline: 'none',
    color: '#666',
    cursor: 'pointer',
  },
  categorySection: {
    marginBottom: '20px',
  },
  categoryLabel: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '12px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    border: '2px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
  },
  categoryIcon: {
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: '11px',
    color: '#666',
  },
  // Account styles
  accountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  accountButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    border: '2px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
  },
  accountName: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
  },
  noteSection: {
    marginBottom: '20px',
  },
  noteLabel: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '8px',
  },
  noteInput: {
    width: '100%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1890FF',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  numberPadOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 10001,
  },
  numberPadContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '20px 20px 0 0',
    overflow: 'hidden',
  },
  numberPadHeader: {
    padding: '20px',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
  },
  numberPadAmount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1890FF',
  },
  numberPad: {
    padding: '16px',
  },
  numberPadRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  numberPadKey: {
    width: '30%',
    padding: '16px',
    fontSize: '24px',
    border: 'none',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPadComplete: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    backgroundColor: '#1890FF',
    color: 'white',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  monthSelector: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '24px',
  },
  monthButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
    textAlign: 'center',
  },
  pieChart: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  pieSvg: {
    width: '200px',
    height: '200px',
  },
  pieLegend: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '6px',
  },
  legendLabel: {
    fontSize: '12px',
    color: '#666',
    flex: 1,
  },
  legendAmount: {
    fontSize: '12px',
    color: '#666',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
  },
  detailLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  detailInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailCategory: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '4px',
  },
  detailPercent: {
    fontSize: '12px',
    color: '#999',
  },
  detailAmount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FF6B6B',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '24px',
  },
  summaryItem: {
    textAlign: 'center',
  },
  // Accounts Page Styles
  addAccountButton: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: 'none',
    cursor: 'pointer',
  },
  accountsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  accountLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  accountCardName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  accountDeleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  // Form Styles
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    color: '#999',
    fontSize: '14px',
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '16px',
    outline: 'none',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    border: '2px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  colorButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
  },
};

export default App;
