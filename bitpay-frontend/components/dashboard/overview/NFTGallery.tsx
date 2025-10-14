"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface NFT {
  id: string;
  type: 'Obligation' | 'Recipient';
  streamId: string;
}

interface NFTGalleryProps {
  nfts: NFT[];
}

export function NFTGallery({ nfts }: NFTGalleryProps) {
  const displayNfts = nfts.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your NFTs</CardTitle>
          {nfts.length > 4 && (
            <Link href="/dashboard/nfts" className="text-xs text-muted-foreground hover:underline">
              View All ({nfts.length})
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {displayNfts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {displayNfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                      <ImageIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge variant={nft.type === 'Obligation' ? 'default' : 'secondary'} className="text-xs">
                      {nft.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">#{nft.streamId}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No NFTs yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
