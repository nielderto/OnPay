// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IDRXPaymentContract
 * @dev Contract to facilitate payments in IDRX tokens 
 * */
contract IDRXPayment is Ownable{
    // Error messages
    error IDRXPayment__InvalidTokenAddress();
    error IDRXPayment__AmountMustBeGreaterThanZero();
    error IDRXPayment__InvalidReceiverAddress();
    error IDRXPayment__TransferFailed();
    error IDRXPayment__FeeTransferFailed();
    error IDRXPayment__InvalidForwarderAddress();
    error IDRXPayment__UnauthorizedForwarder(); 

    IERC20 public idrxToken;
    address public trustedForwarder;
    uint256 public feePercentage = 100;

    // Event emitted on successfull payment
    event PaymentCompleted(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    // Event emitted when the forwarder is updated
    event ForwarderUpdated(
        address indexed forwarder
    );

    constructor(address _idrxToken, address _forwarder) Ownable(msg.sender){
        require(_idrxToken != address(0), IDRXPayment__InvalidTokenAddress());
        require(_forwarder != address(0), IDRXPayment__InvalidForwarderAddress());
        idrxToken = IERC20(_idrxToken);
        trustedForwarder = _forwarder;
        emit ForwarderUpdated(_forwarder);
    }

    function sendIDRXMeta(address _sender, address _receiver, uint256 _amount) external{
        require(msg.sender == trustedForwarder, IDRXPayment__UnauthorizedForwarder());
        require(_amount > 0, IDRXPayment__AmountMustBeGreaterThanZero());
        require(_sender != _receiver && _receiver != address(0), IDRXPayment__InvalidReceiverAddress());

        uint256 fee = (_amount * feePercentage) / 10000; // 1% fee
        uint256 netAmount = _amount - fee;

        require(idrxToken.transferFrom(_sender, _receiver, netAmount), IDRXPayment__TransferFailed());
        require(idrxToken.transferFrom(_sender, tx.origin, fee), IDRXPayment__FeeTransferFailed());

        emit PaymentCompleted(_sender, _receiver, _amount, block.timestamp);
    }
}