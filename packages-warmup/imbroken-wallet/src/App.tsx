import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Define types for tabs for better organization
type TabId = 'send' | 'transactions' | 'form3'; // Update tab ID

// Define type for transaction data from Basescan API
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string; // Value is in wei
  timeStamp: string; // Unix timestamp
  blockNumber: string;
  gasUsed: string;
  gasPrice: string;
  // Add other fields as needed
}

// IMPORTANT: Replace with your actual BaseScan API key
// Get one from https://basescan.org/myapikey
const BASESCAN_API_KEY = import.meta.env.VITE_BASESCAN_API_KEY;

function App() {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [recipients, setRecipients] = useState<string[]>([''])
  const [amount, setAmount] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabId>('send'); // Default tab
  const [transactions, setTransactions] = useState<Transaction[]>([]); // State for transactions
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false); // Loading state
  const [transactionError, setTransactionError] = useState<string | null>(null); // Error state

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('MetaMask is not installed!')
      return
    }

    try {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum)
      setProvider(browserProvider)

      await browserProvider.send('eth_requestAccounts', [])
      const signer = await browserProvider.getSigner()
      setSigner(signer)

      const addr = await signer.getAddress()
      setAddress(addr)

      const bal = await browserProvider.getBalance(addr)
      setBalance(ethers.formatEther(bal))

      // Reset states when wallet connects/changes
      setTransactions([]);
      setTransactionError(null);
      if (activeTab === 'transactions') {
        fetchTransactions(addr); // Fetch transactions if tab is already active
      }

    } catch (err) {
      console.error(err)
      alert('Failed to connect wallet')
    }
  }

  const handleRecipientChange = (index: number, value: string) => {
    const updatedRecipients = [...recipients]
    updatedRecipients[index] = value
    setRecipients(updatedRecipients)
  }

  const handleAddRecipient = () => {
    setRecipients([...recipients, ''])
  }

  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index)
    setRecipients(updatedRecipients)
  }

  const sendEther = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer || recipients.length === 0 || !amount) return

    const validRecipients = recipients.filter(r => ethers.isAddress(r))
    const invalidRecipients = recipients.filter(r => r && !ethers.isAddress(r))

    if (invalidRecipients.length > 0) {
        alert(`Invalid recipient addresses found:\n${invalidRecipients.join('\n')}\nPlease correct them.`)
        return
    }
    if (validRecipients.length === 0) {
        alert('Please enter at least one valid recipient address.')
        return
    }

    try {
        const valueToSend = ethers.parseEther(amount)
        const txPromises = validRecipients.map(recipient => {
            console.log(`Sending ${amount} ETH to ${recipient}`)
            return signer.sendTransaction({
                to: recipient,
                value: valueToSend,
                nonce: 0,
            })
        })

        const txResponses = await Promise.all(txPromises)
        console.log('Transactions sent:', txResponses)

        alert(`Sending transactions to ${validRecipients.length} recipients...`)
        const receipts = await Promise.all(txResponses.map(tx => tx.wait()))
        console.log('Transactions mined:', receipts)

        alert(`Successfully sent ${amount} ETH to ${validRecipients.length} recipients!`)

        if (provider && address) {
            const bal = await provider.getBalance(address)
            setBalance(ethers.formatEther(bal))
            // Re-fetch transactions after sending
            if (activeTab === 'transactions') {
              fetchTransactions(address);
            }
        }
        setRecipients([''])
        setAmount('')

    } catch (err: any) {
        console.error("Transaction failed:", err)
        const message = err.reason || err.message || 'Transaction failed'
        alert(`Transaction failed: ${message}`)
    }
}

// Function to fetch transactions
const fetchTransactions = async (walletAddress: string) => {
  if (BASESCAN_API_KEY === 'YOUR_BASESCAN_API_KEY') {
      setTransactionError('Please replace "YOUR_BASESCAN_API_KEY" with your actual BaseScan API key in App.tsx.');
      setIsLoadingTransactions(false);
      setTransactions([]); // Clear previous transactions
      return;
  }
  if (!walletAddress) {
    setTransactions([]); // Clear transactions if no address
    return;
  }

  setIsLoadingTransactions(true);
  setTransactionError(null);
  setTransactions([]); // Clear previous results before fetching

  const url = `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc&apikey=${BASESCAN_API_KEY}`; // Get latest 25 txs

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();

    if (data.status === '1') {
      // Ensure result is an array before setting state
      setTransactions(Array.isArray(data.result) ? data.result : []);
    } else if (data.message === 'No transactions found') {
      setTransactions([]); // Set to empty array if no transactions
      setTransactionError(null); // Not really an error
    } else {
      throw new Error(data.message || 'Failed to fetch transactions');
    }
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
    setTransactionError(error.message || 'An unexpected error occurred.');
    setTransactions([]); // Clear transactions on error
  } finally {
    setIsLoadingTransactions(false);
  }
};

// useEffect to fetch transactions when the address changes or the tab becomes active
useEffect(() => {
  if (activeTab === 'transactions' && address) {
    fetchTransactions(address);
  }
  // Clear transactions if the tab is not active or address is null
  if (activeTab !== 'transactions' || !address) {
      setTransactions([]);
      setTransactionError(null); // Clear error when switching away or disconnecting
  }
}, [activeTab, address]); // Depend on activeTab and address

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
};

// Helper function to render the currently active form
const renderForm = () => {
  switch (activeTab) {
    case 'send':
      return (
        <form onSubmit={sendEther} className="space-y-4 p-4 bg-white rounded border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Send Ether</h2>

          <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Recipients:</label>
              {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                      <input
                          type="text"
                          placeholder="Recipient address (0x...)"
                          value={recipient}
                          onChange={(e) => handleRecipientChange(index, e.target.value)}
                          className={`flex-grow border ${ethers.isAddress(recipient) || !recipient ? 'border-gray-300' : 'border-red-500'} rounded p-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                      />
                      {recipients.length > 1 && (
                          <button
                              type="button"
                              onClick={() => handleRemoveRecipient(index)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded"
                          >
                              Remove
                          </button>
                      )}
                  </div>
              ))}
              <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="text-sm text-blue-600 hover:text-blue-800"
              >
                  + Add Recipient
              </button>
          </div>

          <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (ETH):</label>
              <input
                  id="amount"
                  type="text"
                  placeholder="e.g., 0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                  pattern="^[0-9]*\.?[0-9]*$"
              />
          </div>

          <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-150 ease-in-out disabled:opacity-50"
              disabled={!signer || !amount || recipients.every(r => !r)}
          >
              Send to {recipients.filter(r => ethers.isAddress(r)).length || 0} Recipients
          </button>
        </form>
      );
    case 'transactions': // New case for transactions tab
      return (
          <div className="p-4 bg-white rounded border border-gray-200 shadow-sm min-h-[200px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Transactions</h2>
              {isLoadingTransactions && <p className="text-center text-gray-500">Loading transactions...</p>}
              {transactionError && <p className="text-center text-red-500">Error: {transactionError}</p>}
              {!isLoadingTransactions && !transactionError && transactions.length === 0 && (
                  <p className="text-center text-gray-500">No transactions found for this address.</p>
              )}
              {!isLoadingTransactions && !transactionError && transactions.length > 0 && (
                  <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {transactions.map((tx) => (
                          <li key={tx.hash} className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                              <p className="font-mono break-all"><strong>Hash:</strong> <a href={`https://basescan.org/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tx.hash}</a></p>
                              <p>TODO</p>
                          </li>
                      ))}
                  </ul>
              )}
          </div>
      );
    default:
      return null;
  }
};

  return (
    <div className="p-8 max-w-lg mx-auto space-y-6 bg-gray-50 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Base Network Wallet</h1>

        {address ? (
            <div className="space-y-4">
                <div className='p-4 bg-white rounded border border-gray-200 shadow-sm'>
                    <p className="text-sm text-gray-600">Connected Address:</p>
                    <p className="break-all font-mono text-gray-800">{address}</p>
                    <p className="mt-2 text-lg font-semibold text-gray-800">
                        Balance: <span className="text-green-600">{parseFloat(balance).toFixed(4)}</span> ETH
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                    <button
                    onClick={() => setActiveTab('send')}
                    className={`py-2 px-4 text-sm font-medium text-center ${activeTab === 'send' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                    Send Ether
                    </button>
                    <button
                    onClick={() => setActiveTab('transactions')}
                    className={`py-2 px-4 text-sm font-medium text-center ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                    Transactions
                    </button>
                    <button
                    onClick={() => setActiveTab('form3')}
                    className={`py-2 px-4 text-sm font-medium text-center ${activeTab === 'form3' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                    Form 3
                    </button>
                    {/* Add more tab buttons as needed */}
                </div>

                 {/* Render Active Form */}
                 <div className="mt-4">
                    {renderForm()}
                 </div>

            </div>
        ) : (
            <div className="text-center">
                <button
                    onClick={connectWallet}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    Connect Wallet
                </button>
                <p className="text-xs text-gray-500 mt-2">Make sure you have wallet extension installed.</p>
            </div>
        )}
    </div>
)
}

export default App
