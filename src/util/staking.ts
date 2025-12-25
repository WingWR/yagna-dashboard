import { ethers } from "ethers";

// 部署后生成的地址
const CONTRACT_ADDRESS = "0x合约地址";

const ABI = [
  "function deposit() public payable",
  "function slash(address _landlord, uint256 _basePercentage) public",
  "function addReward(address _landlord) public payable",
  "function withdraw() public",
  "function getStatus(address _user) public view returns (uint256 stakedAmount, uint256 rewards, uint256 slashCount)",
  "event Staked(address indexed user, uint256 amount)",
  "event Slashed(address indexed user, uint256 amount, string reason, uint256 slashCount)"
];

export class StakingService {
  private contract: ethers.Contract | null = null;

  constructor(providerOrSigner: ethers.BrowserProvider | ethers.Signer) {
    this.init(providerOrSigner);
  }

  private async init(providerOrSigner: any) {
    const signer = "getAddress" in providerOrSigner ? providerOrSigner : await providerOrSigner.getSigner();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  // --- 用户操作 (房东) ---
  // 质押 (输入单位为 MATIC)
  async deposit(amount: string) {
    if (!this.contract) return;
    const tx = await this.contract.deposit({
      value: ethers.parseEther(amount)
    });
    return await tx.wait();
  }

  // 提现全部本金和奖励
  async withdraw() {
    if (!this.contract) return;
    const tx = await this.contract.withdraw();
    return await tx.wait();
  }

  // --- 管理员操作 (通常在管理后台或脚本) ---
  // 惩罚 (输入房东地址和基础百分比)
  async slash(landlordAddress: string, basePercentage: number) {
    if (!this.contract) return;
    const tx = await this.contract.slash(landlordAddress, basePercentage);
    return await tx.wait();
  }

  // 发放奖励 (输入房东地址和奖励金额)
  async addReward(landlordAddress: string, rewardAmount: string) {
    if (!this.contract) return;
    const tx = await this.contract.addReward(landlordAddress, {
      value: ethers.parseEther(rewardAmount)
    });
    return await tx.wait();
  }

  // --- 通用查询 ---
  // 获取状态
  async getStatus(address: string) {
    if (!this.contract) return;
    const [staked, rewards, slashCount] = await this.contract.getStatus(address);
    return {
      staked: ethers.formatEther(staked),
      rewards: ethers.formatEther(rewards),
      slashCount: slashCount.toString()
    };
  }
}