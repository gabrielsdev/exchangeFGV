import { Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import MetaMaskOnboarding from "@metamask/onboarding"
import { EthersService } from "../../EthersService";
import { formattedError } from '@angular/compiler';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


const onboarding = new MetaMaskOnboarding();

export interface OfferData {
   amountToSell: number;
   tokenToSell: string;
   seller: string;
   amountToBuy: number;
   tokenToBuy: string;
   action: number;
}


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  selected = 'option2';
  activeorderbook: boolean;
  selectedAccount : any;
  disablebutton: boolean;
  approved: boolean;
  MPE1balance: any;
  MPE2balance: any;
  sendedCoin: string;
  receivedCoin: string;
  quantCoinSell;
  quantCoinBuy;
  MPE1: string;
  MPE2: string;
  SimpleExchange: string;
  networkStatus: boolean;
  approvedEdit: boolean;

  options = { gasPrice: 1000000000, gasLimit: 1000000, nonce: 45, value: 0 };

  displayedColumns: string[] = ['seller','amountToSell', 'tokenToSell', 'amountToBuy', 'tokenToBuy', 'action'];
  dataSource: MatTableDataSource<OfferData>;

  listaOffers: OfferData[] = [];
  clicked  = new Array();

  constructor(private ethersService: EthersService, private ref: ChangeDetectorRef) {

    /* setInterval(function () {
      self.recuperaOffer(),
      25000}); */

    }



  async ngOnInit(): Promise<void> {
    setInterval(() => {
      this.recuperaContaSelecionada();
      }, 1000);

      setInterval(() => {
      this.recuperaInfos();
      }, 1000); 
    this.ethersService.intializeEthers();
    this.setStatus();
    this.MPE1 = this.ethersService.getCoin(1);
    this.MPE2 = this.ethersService.getCoin(2);
    this.SimpleExchange = this.ethersService.getContractAddress();
    this.recuperaOffer();
    let offers;

        setTimeout(() => {

            if (offers == undefined || offers.length != Array.from(this.listaOffers).length) {
              console.log("ngOnInit :: Inicializa lista de transacoes");
              this.listaOffers = [];
            }
          }, 3030)

          setInterval(() => {
            if (this.activeorderbook == true) {
              if ( offers == undefined || offers.length != Array.from(this.listaOffers).length ) {
                console.log("ngOnInit :: Atualiza se houve mudança.")
                offers = Array.from(this.listaOffers);
                this.dataSource = new MatTableDataSource(offers);
                this.ref.detectChanges()
              }
            }''
          }, 330)
    this.listaOffers.forEach(el => {
      this.clicked.push(false);
    });
  }

  setStatus(){
    this.activeorderbook=null;
    this.disablebutton = true;
    this.approved=false;
    this.quantCoinSell=0;
    this.quantCoinBuy=0;
    this.networkStatus = false;
  }

  async recuperaContaSelecionada(){
      this.selectedAccount = await this.ethersService.getCurrentAccountSync();
      if (await this.ethersService.getNetwork() == true && this.selectedAccount) {
        this.networkStatus = true;
      } else {
        this.networkStatus = false;
      }
  }

  async recuperaInfos(){
    this.MPE1balance =  await this.ethersService.getMPE1BalanceOf(this.selectedAccount);
    this.MPE2balance =  await this.ethersService.getMPE2BalanceOf(this.selectedAccount);

    if (this.sendedCoin == 'MPE1') {
      this.receivedCoin = 'MPE2';
    } else if (this.sendedCoin == 'MPE2'){
      this.receivedCoin = 'MPE1';
    }

    if (this.selectedAccount){
      if (this.sendedCoin) {
        this.disablebutton = false;
      }
    }
  }

  activateBook(){
    if (this.activeorderbook==null) {
      this.activeorderbook=true;
      this.atualizaTabela();
    }else{
      this.activeorderbook = !this.activeorderbook;
    }
  }

  metamaskClick(){
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      this.ethersService.onClickInstall();
    } else {
      this.ethersService.onClickConnect();
    }
  }

  allow(){
    if (this.sendedCoin =="MPE1") {
      this.approved = true;
      this.disablebutton = true;
      this.ethersService.allowExchangeMPE1(this.quantCoinSell*100, this.options);
    } else if (this.sendedCoin =="MPE2"){
      this.approved = true;
      this.ethersService.allowExchangeMPE2(this.quantCoinSell*100, this.options);
    }
  }

  allowAP(index, quant){
    if (index =="MPE1") {
      this.ethersService.allowExchangeMPE1(quant*100, this.options);
    } else {
      this.ethersService.allowExchangeMPE2(quant*100, this.options);
    }
  }

  async createOrder(){
    if (this.sendedCoin =="MPE1") {
      await this.ethersService.criarOffer(this.quantCoinSell*100, this.MPE1, this.quantCoinBuy*100, this.MPE2, this.options);
      this.atualizaTabela();
    } else {
      this.ethersService.criarOffer(this.quantCoinSell*100, this.MPE2, this.quantCoinBuy*100, this.MPE1, this.options);
      this.atualizaTabela();
    }
  }

  async recuperaOffer(){
    if (this.activeorderbook == true) {
      for (let index = 0; index < this.listaOffers.length + 1; index++) {
        var tempoffer1 = await this.ethersService.returnOfferArray(index);
        if (tempoffer1) {
          this.listaOffers[index]= {
            seller: '',
            amountToSell: 0,
            tokenToSell: '',
            amountToBuy: 0,
            tokenToBuy: '',
            action: 0
          };
          this.listaOffers[index].amountToSell = this.converteInteiroParaDecimal(tempoffer1.amountToSell);
          this.listaOffers[index].amountToBuy = this.converteInteiroParaDecimal(tempoffer1.amountToBuy);
          this.listaOffers[index].seller = tempoffer1.seller;
          this.listaOffers[index].tokenToSell = tempoffer1.tokenToSell;
          this.listaOffers[index].tokenToBuy = tempoffer1.tokenToBuy;
          if (tempoffer1.tokenToSell.toString() == this.MPE1) {
            this.listaOffers[index].tokenToSell = 'MPE1';
            this.listaOffers[index].tokenToBuy = 'MPE2';
          } else{
            this.listaOffers[index].tokenToSell = 'MPE2';
            this.listaOffers[index].tokenToBuy = 'MPE1';
          }
          this.listaOffers[index].action = index;
        }
      }
    }
  }

  converteInteiroParaDecimal( _x: number ): number {
    return ( _x / ( 10 ** 2 ) ) ;
}

  async atualizaTabela(){
    this.listaOffers = [];
    await this.recuperaOffer();
  }

  async manipulaOffer(action){
    if (this.listaOffers[action].seller == this.selectedAccount) {
      await this.ethersService.cancel(action, this.options);
      await this.atualizaTabela();
    } else {
      await this.ethersService.accept(action, this.options);
      await this.atualizaTabela();
    }
  }

}
