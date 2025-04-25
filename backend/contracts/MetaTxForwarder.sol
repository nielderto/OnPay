// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface IIDRXPayment {
    function sendIDRXMeta(
        address _sender,
        address _receiver,
        uint256 _amount
    ) external;
}

contract MetaTxForwarder {
    error MetaTxForwarder__InvalidSignatureLength();
    error MetaTxForwarder__InvalidSignature();

    mapping(address => uint256) public nonces;

    event MetaTransactionExecuted(
        address indexed sender, 
        address indexed relayer
    );

    function getMessageHash(address _sender, address _receiver, uint256 _amount, address _targetContract, uint256 _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            _sender,
            _receiver,
            _amount,
            _targetContract,
            _nonce
        ));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns(bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v){
        require(sig.length == 65, MetaTxForwarder__InvalidSignatureLength());
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function verify(address _sender, address _receiver, uint256 _amount, address _targetContract, uint256 _nonce, bytes memory signature) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_sender, _receiver, _amount, _targetContract, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address signer = recoverSigner(ethSignedMessageHash, signature);
        return signer == _sender;
    }

    function executeMetaTransaction(
        address _sender,
        address _receiver,
        uint256 _amount,
        address _targetContract,
        bytes memory signature
    ) external {
        uint256 nonce = nonces[_sender];

        require(verify(_sender, _receiver, _amount, _targetContract, nonce, signature), MetaTxForwarder__InvalidSignature());
        
        nonces[_sender]++;
        
        IIDRXPayment(_targetContract).sendIDRXMeta(_sender, _receiver, _amount);
        
        emit MetaTransactionExecuted(_sender, msg.sender);
    }
}