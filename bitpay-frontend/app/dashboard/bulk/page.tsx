"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import { useCreateStream } from "@/hooks/use-bitpay-write";
import { useBlockHeight } from "@/hooks/use-block-height";
import { displayToMicro } from "@/lib/contracts/config";
import { toast } from "sonner";

interface BulkStreamEntry {
  recipient: string;
  amount: string;
  startBlock: string;
  endBlock: string;
  status: "pending" | "processing" | "success" | "error";
  txId?: string;
  error?: string;
}

export default function BulkStreamPage() {
  const [csvData, setCsvData] = useState("");
  const [streams, setStreams] = useState<BulkStreamEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { blockHeight } = useBlockHeight();
  const { write: createStream } = useCreateStream();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (data: string) => {
    const lines = data.trim().split("\n");
    const entries: BulkStreamEntry[] = [];

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes("recipient") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 4) {
        entries.push({
          recipient: parts[0],
          amount: parts[1],
          startBlock: parts[2],
          endBlock: parts[3],
          status: "pending",
        });
      }
    }

    setStreams(entries);
    if (entries.length > 0) {
      toast.success(`Parsed ${entries.length} streams from CSV`);
    }
  };

  const handleManualInput = () => {
    parseCsvData(csvData);
  };

  const handleProcessStreams = async () => {
    if (streams.length === 0) {
      toast.error("No streams to process");
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);

    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      setCurrentIndex(i);

      // Update status to processing
      setStreams((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : s))
      );

      try {
        // Validate inputs
        if (!stream.recipient.startsWith("SP") && !stream.recipient.startsWith("ST")) {
          throw new Error("Invalid recipient address");
        }

        const amount = parseFloat(stream.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount");
        }

        const startBlock = parseInt(stream.startBlock);
        const endBlock = parseInt(stream.endBlock);
        if (isNaN(startBlock) || isNaN(endBlock) || endBlock <= startBlock) {
          throw new Error("Invalid block range");
        }

        // Create stream
        const txId = await createStream(
          stream.recipient,
          amount,
          startBlock,
          endBlock
        );

        if (txId) {
          setStreams((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "success", txId } : s
            )
          );
        } else {
          throw new Error("Transaction failed");
        }

        // Wait a bit between transactions to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error creating stream ${i}:`, error);
        setStreams((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : s
          )
        );
      }
    }

    setIsProcessing(false);
    toast.success("Bulk stream creation completed!");
  };

  const downloadTemplate = () => {
    const template = `recipient,amount,startBlock,endBlock
SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7,1.5,${blockHeight ? Number(blockHeight) + 10 : "START_BLOCK"},${blockHeight ? Number(blockHeight) + 4320 : "END_BLOCK"}
SP1A3B5C7D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S,2.0,${blockHeight ? Number(blockHeight) + 10 : "START_BLOCK"},${blockHeight ? Number(blockHeight) + 4320 : "END_BLOCK"}`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitpay-bulk-streams-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = streams.length > 0 ? (currentIndex / streams.length) * 100 : 0;
  const successCount = streams.filter((s) => s.status === "success").length;
  const errorCount = streams.filter((s) => s.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bulk Stream Creation</h1>
        <p className="text-muted-foreground">
          Create multiple payment streams at once using CSV import
        </p>
      </div>

      {/* Instructions */}
      <Card className="border-brand-teal/20 bg-brand-teal/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand-teal" />
            How to Use Bulk Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Download the CSV template and fill in your stream details</li>
            <li>Upload the completed CSV file or paste the data manually</li>
            <li>Review the parsed streams in the table below</li>
            <li>Click "Process All Streams" to create them sequentially</li>
          </ol>
          <p className="text-muted-foreground">
            <strong>CSV Format:</strong> recipient,amount,startBlock,endBlock (one stream per line)
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>Get the CSV template with example data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={downloadTemplate}
              className="w-full bg-brand-teal hover:bg-brand-teal/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>Import your prepared CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>
      </div>

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Or Paste CSV Data Manually
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`recipient,amount,startBlock,endBlock
SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7,1.5,${blockHeight ? Number(blockHeight) + 10 : "100000"},${blockHeight ? Number(blockHeight) + 4320 : "104320"}`}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={6}
            disabled={isProcessing}
          />
          <Button onClick={handleManualInput} disabled={!csvData || isProcessing}>
            Parse CSV Data
          </Button>
        </CardContent>
      </Card>

      {/* Preview & Process */}
      {streams.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Streams Preview ({streams.length})
                  </CardTitle>
                  <CardDescription>Review before processing</CardDescription>
                </div>
                <Button
                  onClick={handleProcessStreams}
                  disabled={isProcessing || streams.every((s) => s.status === "success")}
                  className="bg-brand-pink hover:bg-brand-pink/90"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                  ) : (
                    "Process All Streams"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isProcessing && (
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {currentIndex + 1} / {streams.length}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Recipient</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Start Block</th>
                      <th className="pb-2">End Block</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streams.map((stream, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{idx + 1}</td>
                        <td className="py-2 font-mono text-xs">
                          {stream.recipient.slice(0, 8)}...{stream.recipient.slice(-6)}
                        </td>
                        <td className="py-2">{stream.amount} sBTC</td>
                        <td className="py-2">{stream.startBlock}</td>
                        <td className="py-2">{stream.endBlock}</td>
                        <td className="py-2">
                          {stream.status === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {stream.status === "processing" && (
                            <Badge className="bg-blue-500">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Processing
                            </Badge>
                          )}
                          {stream.status === "success" && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          )}
                          {stream.status === "error" && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{streams.length}</p>
                  <p className="text-xs text-muted-foreground">Total Streams</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{successCount}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
