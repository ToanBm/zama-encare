// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { FHE, euint8, euint16, euint64, externalEuint8, externalEuint16, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ZamaHealth is SepoliaConfig {
    struct Session {
        address user;
        bool exists;
        euint64 weight;
        euint64 height;
        euint8 exercise;
        euint8 diet;
        euint64 result;
        bool resultReady;
    }

    address public owner;
    IERC20 public usdc;
    address public backendOracle; // address được cấp quyền giải mã (ACL)

    uint256 public constant VISIT_FEE = 10 * 1e6; // 10 USDC (6 decimals)
    mapping(uint256 => Session) public sessions;
    uint256 public nextSessionId;

    event SessionCreated(uint256 indexed sessionId);
    event SessionInputSubmitted(uint256 indexed sessionId);
    event SessionResultSubmitted(uint256 indexed sessionId);
    event FeesWithdrawn(address to, uint256 amount);
    event BackendOracleUpdated(address indexed oldOracle, address indexed newOracle);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
    }

    // --- Admin: cấu hình backend oracle để được cấp quyền giải mã ---
    function setBackendOracle(address _backend) external onlyOwner {
        address old = backendOracle;
        backendOracle = _backend;
        emit BackendOracleUpdated(old, _backend);
    }

    function createSession() external returns (uint256) {
        require(usdc.transferFrom(msg.sender, address(this), VISIT_FEE), "Payment failed");

        uint256 sessionId = nextSessionId++;
        sessions[sessionId].user = msg.sender;
        sessions[sessionId].exists = true;

        emit SessionCreated(sessionId);
        return sessionId;
    }

    // User gửi dữ liệu đã mã hóa. Tại đây cấp ACL cho contract & backend oracle.
    function submitEncryptedInput(
        uint256 sessionId,
        externalEuint64 extWeight,
        externalEuint64 extHeight,
        externalEuint8 extExercise,
        externalEuint8 extDiet,
        bytes calldata att
    ) external {
        Session storage s = sessions[sessionId];
        require(s.exists, "Invalid session");
        require(s.user == msg.sender, "Not session owner");
        require(backendOracle != address(0), "Backend not set");

        euint64 weight = FHE.fromExternal(extWeight, att);
        euint64 height = FHE.fromExternal(extHeight, att);
        euint8 exercise = FHE.fromExternal(extExercise, att);
        euint8 diet = FHE.fromExternal(extDiet, att);

        // Cho phép contract tự truy cập (nếu cần tính toán on-chain nhẹ)
        FHE.allow(weight, address(this));
        FHE.allow(height, address(this));
        FHE.allow(exercise, address(this));
        FHE.allow(diet, address(this));

        // CẤP QUYỀN CHO BACKEND ORACLE GIẢI MÃ/ĐỌC DỮ LIỆU
        FHE.allow(weight, backendOracle);
        FHE.allow(height, backendOracle);
        FHE.allow(exercise, backendOracle);
        FHE.allow(diet, backendOracle);
        // Nếu muốn chỉ cấp tạm thời theo tx, có thể dùng FHE.allowTransient(...)

        s.weight = weight;
        s.height = height;
        s.exercise = exercise;
        s.diet = diet;

        emit SessionInputSubmitted(sessionId);
    }

    // Backend gửi kết quả đã mã hóa (sau khi inference) vào contract
    function submitEncryptedResult(
        uint256 sessionId,
        externalEuint64 extResult,
        bytes calldata att
    ) external {
        Session storage s = sessions[sessionId];
        require(s.exists, "Invalid session");
        require(s.user != address(0), "No owner");
        require(!s.resultReady, "Result already submitted");

        euint64 result = FHE.fromExternal(extResult, att);
        // Cho phép user giải mã kết quả
        FHE.allow(result, s.user);
        // (Tuỳ chọn) Cho phép backend đọc lại kết quả nếu cần audit/log
        if (backendOracle != address(0)) {
            FHE.allow(result, backendOracle);
        }
        // (Tuỳ chọn) Cho phép contract đọc nếu cần logic tiếp
        FHE.allow(result, address(this));

        s.result = result;
        s.resultReady = true;

        emit SessionResultSubmitted(sessionId);
    }

    // Getter cho backend (và user) lấy input đã mã hoá để xử lý off-chain
    function getEncryptedInputs(
        uint256 sessionId
    ) external view returns (euint64, euint64, euint8, euint8) {
        Session storage s = sessions[sessionId];
        require(s.exists, "Invalid session");
        require(
            msg.sender == s.user || msg.sender == backendOracle || msg.sender == owner,
            "Not authorized"
        );
        return (s.weight, s.height, s.exercise, s.diet);
    }

    function getEncryptedResult(uint256 sessionId) external view returns (euint64) {
        Session storage s = sessions[sessionId];
        require(s.exists, "Invalid session");
        require(s.user == msg.sender, "Not session owner");
        require(s.resultReady, "Result not ready");
        return s.result;
    }

    function withdrawFees(address to) external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(usdc.transfer(to, balance), "Withdraw failed");
        emit FeesWithdrawn(to, balance);
    }

    function contractBalance() external view onlyOwner returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
