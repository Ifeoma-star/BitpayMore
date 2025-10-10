import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT = "bitpay-nft";

describe("bitpay-nft contract", () => {

  describe("SIP-009 NFT Trait Functions", () => {
    it("should return initial last-token-id as 0", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-last-token-id",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("should return none for token-uri", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });

    it("should return none for non-existent token owner", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-owner",
        [Cl.uint(999)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Minting Stream NFTs", () => {
    it("should mint NFT for a stream", () => {
      const streamId = 1;

      const { result } = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(streamId), Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(1)); // First token ID
    });

    it("should increment token ID on successive mints", () => {
      // Mint first NFT
      const first = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(1), Cl.principal(wallet1)],
        deployer
      );
      const firstId = Number((first.result as any).value.value);

      // Mint second NFT
      const second = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(2), Cl.principal(wallet2)],
        deployer
      );
      const secondId = Number((second.result as any).value.value);

      expect(secondId).toBe(firstId + 1);
    });

    it("should set correct owner after minting", () => {
      const streamId = 5;

      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(streamId), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-owner",
        [Cl.uint(tokenId)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });

    it("should update last-token-id after minting", () => {
      // Get initial count
      const initialResult = simnet.callReadOnlyFn(
        CONTRACT,
        "get-last-token-id",
        [],
        deployer
      );
      const initialId = Number((initialResult.result as any).value.value);

      // Mint new NFT
      simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(10), Cl.principal(wallet1)],
        deployer
      );

      // Check updated count
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-last-token-id",
        [],
        deployer
      );

      const newId = Number((result as any).value.value);
      expect(newId).toBe(initialId + 1);
    });
  });

  describe("Token to Stream Mapping", () => {
    it("should map token ID to stream ID", () => {
      const streamId = 100;

      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(streamId), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-stream-id",
        [Cl.uint(tokenId)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.uint(streamId)));
    });

    it("should map stream ID to token ID", () => {
      const streamId = 200;

      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(streamId), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-token-id",
        [Cl.uint(streamId)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.uint(tokenId)));
    });

    it("should return none for unmapped stream ID", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-token-id",
        [Cl.uint(9999)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });

    it("should return none for unmapped token ID", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-stream-id",
        [Cl.uint(9999)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });
  });

  describe("NFT Transfer", () => {
    it("should allow owner to transfer NFT", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(50), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // Transfer from wallet1 to wallet2
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update owner after transfer", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(60), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // Transfer to wallet2
      simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      // Check new owner
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-owner",
        [Cl.uint(tokenId)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.principal(wallet2)));
    });

    it("should fail when non-owner tries to transfer", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(70), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // wallet3 tries to transfer (not owner)
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet3)],
        wallet3
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_NOT_TOKEN_OWNER
    });

    it("should fail when sender is not tx-sender", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(80), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // wallet2 tries to send on behalf of wallet1
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(tokenId), Cl.principal(wallet1), Cl.principal(wallet3)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_NOT_TOKEN_OWNER
    });
  });

  describe("Burning Stream NFTs", () => {
    it("should allow owner to burn their NFT", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(90), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // Burn NFT
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "burn",
        [Cl.uint(tokenId), Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should remove owner after burning", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(95), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // Burn NFT
      simnet.callPublicFn(
        CONTRACT,
        "burn",
        [Cl.uint(tokenId), Cl.principal(wallet1)],
        wallet1
      );

      // Check owner is none
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-owner",
        [Cl.uint(tokenId)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });

    it("should fail when non-owner tries to burn", () => {
      // Mint NFT to wallet1
      const mintResult = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.uint(96), Cl.principal(wallet1)],
        deployer
      );
      const tokenId = Number((mintResult.result as any).value.value);

      // wallet2 tries to burn (not owner)
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "burn",
        [Cl.uint(tokenId), Cl.principal(wallet1)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_NOT_TOKEN_OWNER
    });
  });
});
