"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bitcoin,
  Clock,
  Info,
  Wallet,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const createStreamSchema = z.object({
  recipient: z.string().min(1, "Recipient address is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  duration: z.string().min(1, "Duration is required"),
  durationType: z.enum(["blocks", "days", "weeks", "months"]),
  description: z.string().optional(),
  startImmediately: z.boolean().default(true),
  startDate: z.string().optional(),
});

type CreateStreamForm = z.infer<typeof createStreamSchema>;

export default function CreateStreamPage() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(createStreamSchema),
    defaultValues: {
      recipient: "",
      amount: "",
      duration: "",
      durationType: "days" as const,
      description: "",
      startImmediately: true,
    },
  });

  const watchedValues = form.watch();

  // Calculate estimated values
  const calculateEstimates = () => {
    const amount = parseFloat(watchedValues.amount || "0");
    const duration = parseInt(watchedValues.duration || "0");

    if (!amount || !duration) return null;

    let durationInSeconds = 0;
    switch (watchedValues.durationType) {
      case "blocks":
        durationInSeconds = duration * 600; // 10 minutes per block
        break;
      case "days":
        durationInSeconds = duration * 24 * 60 * 60;
        break;
      case "weeks":
        durationInSeconds = duration * 7 * 24 * 60 * 60;
        break;
      case "months":
        durationInSeconds = duration * 30 * 24 * 60 * 60;
        break;
    }

    const perSecond = amount / durationInSeconds;
    const perMinute = perSecond * 60;
    const perHour = perSecond * 3600;
    const perDay = perSecond * 86400;

    return {
      perSecond: perSecond.toFixed(8),
      perMinute: perMinute.toFixed(8),
      perHour: perHour.toFixed(6),
      perDay: perDay.toFixed(4),
      totalDuration: durationInSeconds,
    };
  };

  const estimates = calculateEstimates();

  const onSubmit = async (data: CreateStreamForm) => {
    setIsCreating(true);

    try {
      // TODO: Integrate with smart contract
      console.log("Creating stream:", data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Stream created successfully!");
      router.push("/dashboard/streams");
    } catch (error) {
      toast.error("Failed to create stream. Please try again.");
      console.error("Stream creation error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const validateAddress = (address: string) => {
    // Basic Stacks address validation
    return address.startsWith("SP") || address.startsWith("ST");
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/streams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Stream</h1>
            <p className="text-muted-foreground mt-1">Set up a continuous Bitcoin payment stream</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,450px]">
          {/* Main Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-brand-pink" />
                  Stream Details
                </CardTitle>
                <CardDescription>
                  Configure your Bitcoin stream parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Recipient */}
                    <FormField
                      control={form.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Recipient Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SP1J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                              className={`h-12 ${
                                field.value && !validateAddress(field.value)
                                  ? "border-red-500"
                                  : ""
                              }`}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a valid Stacks address (starts with SP or ST)
                          </FormDescription>
                          <FormMessage />

                          {field.value && !validateAddress(field.value) && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                              <AlertCircle className="h-4 w-4" />
                              Invalid Stacks address format
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Total Amount (sBTC)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="number"
                                step="0.00000001"
                                min="0"
                                placeholder="0.00000000"
                                className="h-12 pl-11 text-lg"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Total amount to stream over the specified duration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Duration */}
                    <div className="space-y-4">
                      <Label className="text-base">Stream Duration</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="30"
                                    className="h-11 pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="durationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="blocks">Blocks</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="weeks">Weeks</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Monthly salary, Project payment, Consulting fees..."
                              className="resize-none min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Add a note to help identify this stream later
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-8" />

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isCreating || !form.formState.isValid}
                        className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white"
                      >
                        {isCreating ? "Creating Stream..." : "Create Stream"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stream Preview */}
            <Card className="border-brand-pink/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-pink" />
                  Stream Preview
                </CardTitle>
                <CardDescription>Real-time streaming rate calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {estimates ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="font-semibold text-lg">{watchedValues.amount || "0"} sBTC</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="font-semibold">
                          {watchedValues.duration || "0"} {watchedValues.durationType}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Streaming Rates
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Per second</span>
                          <span className="text-brand-pink font-mono font-medium">{estimates.perSecond}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Per minute</span>
                          <span className="text-brand-teal font-mono font-medium">{estimates.perMinute}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Per hour</span>
                          <span className="text-brand-pink font-mono font-medium">{estimates.perHour}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Per day</span>
                          <span className="text-brand-teal font-mono font-medium text-base">{estimates.perDay}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Bitcoin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm text-muted-foreground">
                      Enter amount and duration to see streaming rates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
                <CardDescription>Pre-configured payment schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => {
                    form.setValue("amount", "2.5");
                    form.setValue("duration", "30");
                    form.setValue("durationType", "days");
                    form.setValue("description", "Monthly salary payment");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    <div>
                      <div className="font-medium">Monthly Salary</div>
                      <div className="text-xs text-muted-foreground">2.5 sBTC over 30 days</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => {
                    form.setValue("amount", "1.0");
                    form.setValue("duration", "7");
                    form.setValue("durationType", "days");
                    form.setValue("description", "Weekly project payment");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <div className="font-medium">Weekly Project</div>
                      <div className="text-xs text-muted-foreground">1.0 sBTC over 7 days</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => {
                    form.setValue("amount", "0.5");
                    form.setValue("duration", "1000");
                    form.setValue("durationType", "blocks");
                    form.setValue("description", "Short-term payment");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="font-medium">Quick Payment</div>
                      <div className="text-xs text-muted-foreground">0.5 sBTC over 1000 blocks</div>
                    </div>
                  </div>
                </Button>

                <Separator className="my-4" />

                <Link href="/dashboard/templates">
                  <Button variant="ghost" className="w-full" size="sm">
                    View All Templates →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Streams cannot be modified once created</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Recipients can withdraw vested amounts anytime</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Cancelling returns only unvested amounts</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Ensure sufficient sBTC balance before creating</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Network fees apply for stream creation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium mb-2 ${className}`}>{children}</div>;
}
