import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ethers } from "ethers";
import MetaMaskOnboarding from '@metamask/onboarding'
import { formattedError } from '@angular/compiler';
import { ADDRGETNETWORKPARAMS } from 'dns';

declare let require: any;
const SimpleExchangeAbi = require('./SimpleExchange.json');
const MPEAbi = require('./IERC20.json');

@Injectable({
  providedIn: 'root'
})
export class EthersService {

  private ethereum: any;
  private accountProvider: any;
  private onboarding = new MetaMaskOnboarding();
  private signer: any;
  private SimpleExchangeAddress = '0x21930A04D8535767F0d9e03d7df0D652eB706fF9';
  private MPE1Address = '0x341DeEef908ee21a7ffbeF4a475466456946BB35';
  private MPE2Address = '0x9839bcF3d9D661ab0875187924dc000E5A6aBeb1';

  private SimpleExchangeContract: any;
  private MPE1Contract: any;
  private MPE2Contract: any;


  constructor() {}

  async intializeEthers() {
    this.ethereum =  window['ethereum'];
    this.accountProvider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.accountProvider.getSigner();
    console.log("accountProvider= ");
    console.log(this.accountProvider);


    this.SimpleExchangeContract = new ethers.Contract(this.SimpleExchangeAddress, SimpleExchangeAbi, this.signer);
    console.log("SimpleExchange Contract:");
    console.log(this.SimpleExchangeContract);

    this.MPE1Contract = new ethers.Contract(this.MPE1Address, MPEAbi, this.signer);
    console.log("MPE1 Contract:");
    console.log(this.MPE1Contract);

    this.MPE2Contract = new ethers.Contract(this.MPE2Address, MPEAbi, this.signer);
    console.log("MPE2 Contract:");
    console.log(this.MPE2Contract);
  }

  public async getCurrentAccountSync() {
    var address = await this.ethereum.request({ method: 'eth_accounts' });
    if(address && address.length != 0){
      var stringAddress = address.toString();
      var checksumAddress = ethers.utils.getAddress(stringAddress);
      return checksumAddress;
    } else{
       return undefined;
    }

  }

  public getNetwork(){
    if (this.accountProvider.network.name == 'sepolia') {
      return true
    } else {
      return false
    }
  }

  async  getMPE1BalanceOf(address: string){
    const balance = await this.MPE1Contract.balanceOf(address);
    const balanceWithDecimals = this.converteInteiroParaDecimal(balance);
    return balanceWithDecimals.toString();
  }

  async  getMPE2BalanceOf(address: string){
    const balance = await this.MPE2Contract.balanceOf(address);
    const balanceWithDecimals = this.converteInteiroParaDecimal(balance);
    return balanceWithDecimals.toString();
  }

  getCoin(coin: number){
    if (coin == 1) {
      return this.MPE1Address;
    } else {
      return this.MPE2Address;
    }
  }

  converteInteiroParaDecimal( _x: number ): number {
    return ( _x / ( 10 ** 2 ) ) ;
}

  getContractAddress(){
    return this.SimpleExchangeAddress;
  }

  async allowExchangeMPE1(amount: number, options){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.MPE1Contract.connect(signer);
    await contWithSigner.approve(this.SimpleExchangeAddress , amount, options);
  }

  async allowExchangeMPE2(amount: number, options){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.MPE2Contract.connect(signer);
    await contWithSigner.approve(this.SimpleExchangeAddress , amount, options);
  }

  async criarOffer(amountToSell: number, tokenToSell: string, amountToBuy: number, tokenToBuy: string, options){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.SimpleExchangeContract.connect(signer);
    await contWithSigner.putOffer(amountToSell, tokenToSell, amountToBuy, tokenToBuy, options);
  }

  async returnOfferArray(i: number){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.SimpleExchangeContract.connect(signer);
    return (await contWithSigner.offers(i));
  }

  async accept(i: number, options){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.SimpleExchangeContract.connect(signer);
    contWithSigner.acceptOffer(i, options);
  }

  async cancel(i: number, options){
    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.SimpleExchangeContract.connect(signer);
    contWithSigner.cancelOffer(i, options);
  }


  //Checar se Metamask esta instalado
  public onClickInstall(){
    this.onboarding.startOnboarding();
};

  async onClickConnect(){
      try {
        await this.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error(error);
      }
  };

}
