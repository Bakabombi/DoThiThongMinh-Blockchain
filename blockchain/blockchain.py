from web3 import Web3
import json
import logging

logger = logging.getLogger(__name__)

# ====================================
# GANACHE CONNECTION
# ====================================

GANACHE_URL = "http://127.0.0.1:7545"
CHAIN_ID = 1337

try:
    web3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if web3.is_connected():
        logger.info("✅ Connected to Ganache")
    else:
        logger.error("❌ Failed to connect to Ganache")
except Exception as e:
    logger.error(f"❌ Ganache connection error: {e}")

# ====================================
# ACCOUNT & CONTRACT CONFIGURATION
# ====================================

ACCOUNT_ADDRESS = web3.eth.accounts[0]  # First Ganache account
PRIVATE_KEY = "0xdb32e743bf6c652f76ddaa2952049e6a9a097c06aed2e7ea6ff863a9d467cf79"
CONTRACT_ADDRESS = "0x5677c9A59CBaFe7A9f89Cd08B2D1B308810b4DC6"

# ====================================
# ABI - SMART CONTRACT INTERFACE
# ====================================

abi = [
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "string",
				"name": "hashValue",
				"type": "string"
			}
		],
		"name": "DataStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "storeData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getData",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "latestHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

# ====================================
# CONTRACT INITIALIZATION
# ====================================

try:
    contract = web3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=abi
    )
    logger.info(f"✅ Contract initialized: {CONTRACT_ADDRESS}")
except Exception as e:
    logger.error(f"❌ Contract initialization error: {e}")
    contract = None

# ====================================
# SEND HASH TO BLOCKCHAIN
# ====================================

def send_hash_to_blockchain(hash_code):
    """
    Gửi hash dữ liệu lên Ganache blockchain
    
    Args:
        hash_code (str): SHA256 hash code
        
    Returns:
        str: Transaction hash (tx_hash)
    """
    try:
        if not contract:
            logger.error("Contract not initialized")
            return None
        
        # Get nonce for account
        nonce = web3.eth.get_transaction_count(ACCOUNT_ADDRESS)
        logger.info(f"Nonce: {nonce}")
        
        # Build transaction
        tx = contract.functions.storeData(
            hash_code
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': web3.to_wei('50', 'gwei'),
            'nonce': nonce,
            'from': ACCOUNT_ADDRESS
        })
        
        logger.info(f"Transaction built for hash: {hash_code}")
        
        # Sign transaction
        signed_tx = web3.eth.account.sign_transaction(
            tx,
            PRIVATE_KEY
        )
        logger.info(f"Transaction signed")
        
        # Send signed transaction
        tx_hash = web3.eth.send_raw_transaction(
            signed_tx.raw_transaction
        )
        
        tx_hash_hex = web3.to_hex(tx_hash)
        logger.info(f"✅ Hash sent to blockchain: {tx_hash_hex}")
        
        return tx_hash_hex
        
    except Exception as e:
        logger.error(f"❌ Error sending hash to blockchain: {e}")
        return None

# ====================================
# GET STORED DATA FROM BLOCKCHAIN
# ====================================

def get_data_from_blockchain():
    """
    Lấy dữ liệu cuối cùng từ smart contract
    
    Returns:
        str: Latest hash stored on blockchain
    """
    try:
        if not contract:
            logger.error("Contract not initialized")
            return None
        
        latest_hash = contract.functions.getData().call()
        logger.info(f"✅ Latest hash from blockchain: {latest_hash}")
        
        return latest_hash
        
    except Exception as e:
        logger.error(f"❌ Error getting data from blockchain: {e}")
        return None

# ====================================
# VERIFY BLOCKCHAIN DATA
# ====================================

def verify_blockchain_hash(hash_code):
    """
    Kiểm tra xem hash có tồn tại trên blockchain không
    
    Args:
        hash_code (str): Hash code to verify
        
    Returns:
        bool: True nếu hash tồn tại, False nếu không
    """
    try:
        latest_hash = get_data_from_blockchain()
        is_valid = (latest_hash == hash_code)
        
        logger.info(f"Hash verification: {is_valid}")
        return is_valid
        
    except Exception as e:
        logger.error(f"❌ Error verifying hash: {e}")
        return False

# ====================================
# GANACHE STATUS CHECK
# ====================================

def check_ganache_status():
    """
    Kiểm tra trạng thái kết nối Ganache
    
    Returns:
        dict: Status information
    """
    try:
        is_connected = web3.is_connected()
        latest_block = web3.eth.block_number if is_connected else None
        accounts = web3.eth.accounts if is_connected else []
        
        status = {
            "connected": is_connected,
            "latest_block": latest_block,
            "accounts_count": len(accounts),
            "url": GANACHE_URL
        }
        
        logger.info(f"Ganache status: {status}")
        return status
        
    except Exception as e:
        logger.error(f"❌ Error checking Ganache status: {e}")
        return {"connected": False, "error": str(e)}