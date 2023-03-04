pragma solidity ^0.6.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract SimpleExchange 
{
    struct Offer 
    {
        uint amountToSell;
        IERC20 tokenToSell;
        address seller;
        uint amountToBuy;
        IERC20 tokenToBuy;
    }
    
    Offer[] public offers; 

    function getOffersLength() public view returns (uint) 
    {
        return offers.length;
    }

    function putOffer(uint amountToSell, IERC20 tokenToSell, uint amountToBuy, IERC20 tokenToBuy) public 
    {
        address seller = msg.sender;
        tokenToSell.transferFrom(seller, address(this), amountToSell);
        Offer memory offer = Offer(amountToSell, tokenToSell, seller, amountToBuy, tokenToBuy);
        offers.push(offer);
    }
    
    function acceptOffer(uint index) public
    {
        address buyer = msg.sender;
        require(index < offers.length);
        offers[index].tokenToSell.transfer(buyer, offers[index].amountToSell);
        offers[index].tokenToBuy.transferFrom(buyer, offers[index].seller, offers[index].amountToBuy);
        deleteOffer(index);
    }
    
    function cancelOffer(uint index) public
    {
        require(index < offers.length);

        require(msg.sender == offers[index].seller);
        offers[index].tokenToSell.transfer(offers[index].seller, offers[index].amountToSell);
        deleteOffer(index);
    }
    
    function deleteOffer(uint index) internal 
    {
        offers[index] = offers[offers.length - 1];
        offers.pop();
    }
}