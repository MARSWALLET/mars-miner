import React, { useEffect, useState } from "react"
import axios from "axios"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import {
  FaRocket,
  FaCoins,
  FaBolt,
  FaChartLine,
  FaExchangeAlt,
  FaUserFriends,
  FaBank,
  FaTrophy,
  FaGift,
  FaHistory,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import MinerCarousel from "./components/MinerCarousel"
import LoadingSpinner from "./components/LoadingSpinner"
import BankInfoForm from "./components/BankInfoForm"
import Achievements from "./components/Achievements"
import DailyBonus from "./components/DailyBonus"
import MiningSimulation from "./components/MiningSimulation"
import TransactionHistory from "./components/TransactionHistory"
import "./App.css"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

function App() {
  const [user, setUser] = useState(null);
  const [miners, setMiners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [referralCode, setReferralCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    telegram.ready();
    telegram.expand();

    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/user/${telegram.initDataUnsafe.user.id}`);
        setUser(userResponse.data);
        setReferralCode(userResponse.data.referralCode);

        const minersResponse = await axios.get(`${API_BASE_URL}/api/miners`);
        setMiners(minersResponse.data);

        const transactionsResponse = await axios.get(`${API_BASE_URL}/api/transactions/${telegram.initDataUnsafe.user.id}`);
        setTransactions(transactionsResponse.data);

        const leaderboardResponse = await axios.get(`${API_BASE_URL}/api/leaderboard`);
        setLeaderboard(leaderboardResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        telegram.showAlert('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const buyMiner = async (minerId: string) => {
    try {
      const telegram = (window as any).Telegram.WebApp;
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/buy-miner`, {
        telegramId: telegram.initDataUnsafe.user.id,
        minerId,
      });
      if (response.data.success) {
        telegram.showAlert('Miner purchased successfully!');
        // Refresh user data
        const userResponse = await axios.get(`${API_BASE_URL}/api/user/${telegram.initDataUnsafe.user.id}`);
        setUser(userResponse.data);
      } else {
        telegram.showAlert('Failed to purchase miner. Please try again.');
      }
    } catch (error) {
      console.error('Error buying miner:', error);
      (window as any).Telegram.WebApp.showAlert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: transactions.map((t: any) => new Date(t.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Wallet Balance',
        data: transactions.map((t: any, index: number) => {
          const balance = transactions.slice(0, index + 1).reduce((sum: number, curr: any) => sum + curr.amount, 0);
          return balance.toFixed(2);
        }),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard"
    >
      <div className="stats-container">
        <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
          <FaCoins className="stat-icon" />
          <h3>Balance</h3>
          <p>₦{user?.walletBalance.toFixed(2)}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
          <FaBolt className="stat-icon" />
          <h3>Hash Power</h3>
          <p>{user?.hashPower} HP</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
          <FaRocket className="stat-icon" />
          <h3>Miners</h3>
          <p>{user?.miners.length}</p>
        </motion.div>
      </div>
      <div className="chart-container">
        <h3>Wallet Balance History</h3>
        <Line data={chartData} options={{ responsive: true, maintainAh3>
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <MiningSimulation user={user} />
    </motion.div>
  );

  const renderMiners = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="miners-container"
    >
      <MinerCarousel miners={miners} onBuy={buyMiner} />
    </motion.div>
  );

  const renderTransactions = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transactions-container"
    >
      <TransactionHistory transactions={transactions} />
    </motion.div>
  );

  const renderReferral = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="referral-container"
    >
      <h3>Invite Friends</h3>
      <p>Share your referral code and earn 5% of your friends' deposits!</p>
      <div className="referral-code">
        <input type="text" value={referralCode} readOnly />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            navigator.clipboard.writeText(referralCode);
            (window as any).Telegram.WebApp.showAlert('Referral code copied to clipboard!');
          }}
        >
          Copy
        </motion.button>
      </div>
    </motion.div>
  );

  const renderLeaderboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="leaderboard-container"
    >
      <h3>Top Miners</h3>
      <ul className="leaderboard-list">
        {leaderboard.map((user: any, index: number) => (
          <motion.li
            key={user._id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="leaderboard-item"
          >
            <span className="rank">{index + 1}</span>
            <span className="name">{user.name}</span>
            <span className="hash-power">{user.hashPower} HP</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  const renderBankInfo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bank-info-container"
    >
      <h3>Bank Information</h3>
      <BankInfoForm userId={user?.id} />
    </motion.div>
  );

  const renderAchievements = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="achievements-container"
    >
      <h3>Achievements</h3>
      <Achievements userId={user?.id} />
    </motion.div>
  );

  const renderDailyBonus = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="daily-bonus-container"
    >
      <h3>Daily Bonus</h3>
      <DailyBonus userId={user?.id} />
    </motion.div>
  );

  return (
    <div className="App">
      <header>
        <h1>MarsMiner</h1>
      </header>
      <nav>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
          <FaChartLine /> Dashboard
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('miners')} className={activeTab === 'miners' ? 'active' : ''}>
          <FaRocket /> Miners
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'active' : ''}>
          <FaExchangeAlt /> Transactions
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('referral')} className={activeTab === 'referral' ? 'active' : ''}>
          <FaUserFriends /> Referral
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('leaderboard')} className={activeTab === 'leaderboard' ? 'active' : ''}>
          <FaChartLine /> Leaderboard
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('bankInfo')} className={activeTab === 'bankInfo' ? 'active' : ''}>
          <FaBank /> Bank Info
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('achievements')} className={activeTab === 'achievements' ? 'active' : ''}>
          <FaTrophy /> Achievements
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('dailyBonus')} className={activeTab === 'dailyBonus' ? 'active' : ''}>
          <FaGift /> Daily Bonus
        </motion.button>
      </nav>
      <main>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'miners' && renderMiners()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'referral' && renderReferral()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
            {activeTab === 'bankInfo' && renderBankInfo()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'dailyBonus' && renderDailyBonus()}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default App;

