// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Permissioned {
  address public admin;

  constructor() public {
    admin = msg.sender;
  }

  modifier adminOnly() {
    require(msg.sender == admin);
    _;
  }

  function setAdmin(address _admin) adminOnly public {
    admin = _admin;
  }
}
