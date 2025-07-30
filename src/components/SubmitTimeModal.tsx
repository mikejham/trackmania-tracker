import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Clock } from "lucide-react";
import { apiClient } from "../services/api";
import { parseTime, isValidTimeFormat } from "../utils/time";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

interface SubmitTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: {
    id: string;
    name: string;
  };
}

const submitTimeSchema = z.object({
  trackId: z.string().min(1, "Please select a track").optional(),
  time: z.string().refine(isValidTimeFormat, {
    message: "Please enter a valid time (e.g., 1:23.456 or 1:23)",
  }),
});

type SubmitTimeFormData = z.infer<typeof submitTimeSchema>;

// Smart Time Input Component
const SmartTimeInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [milliseconds, setMilliseconds] = useState("");

  // Parse existing value on mount
  React.useEffect(() => {
    if (value) {
      const parts = value.split(":");
      if (parts.length === 2) {
        const timeParts = parts[1].split(".");
        setMinutes(parts[0]);
        setSeconds(timeParts[0]);
        setMilliseconds(timeParts[1] || "");
      }
    }
  }, [value]);

  const updateTime = (
    newMinutes: string,
    newSeconds: string,
    newMilliseconds: string
  ) => {
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    setMilliseconds(newMilliseconds);

    // Only format the complete time string when we have actual values
    if (newMinutes || newSeconds || newMilliseconds) {
      const formattedMinutes = newMinutes || "0";
      // Don't pad during input - only pad in preview and final submission
      const formattedSeconds = newSeconds || "00";
      const formattedMs = newMilliseconds || "000";

      const timeString = `${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
      onChange(timeString);
    } else {
      onChange("");
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2); // Only numbers, max 2 digits
    updateTime(val, seconds, milliseconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2); // Only numbers, max 2 digits
    updateTime(minutes, val, milliseconds);
  };

  const handleMillisecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3); // Only numbers, max 3 digits
    updateTime(minutes, seconds, val);
  };

  const isValid = minutes !== "" || seconds !== "" || milliseconds !== "";

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Minutes</label>
          <Input
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="0"
            className="text-center text-sm sm:text-base"
            maxLength={2}
          />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-400 mt-6">
          :
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Seconds</label>
          <Input
            value={seconds}
            onChange={handleSecondsChange}
            placeholder="00"
            className="text-center text-sm sm:text-base"
            maxLength={2}
          />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-400 mt-6">
          .
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            Milliseconds
          </label>
          <Input
            value={milliseconds}
            onChange={handleMillisecondsChange}
            placeholder="000"
            className="text-center text-sm sm:text-base"
            maxLength={3}
          />
        </div>
      </div>

      {/* Preview */}
      {isValid && (
        <div className="text-center p-2 bg-gray-50 rounded border">
          <span className="text-xs sm:text-sm text-gray-600">Preview: </span>
          <span className="font-mono font-bold text-gray-800 text-sm sm:text-base">
            {minutes || "0"}:{(seconds || "0").padStart(2, "0")}.
            {(milliseconds || "0").padEnd(3, "0")}
          </span>
        </div>
      )}

      {/* Help Text */}
      <div className="space-y-2">
        <span className="text-xs text-gray-500">Examples:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="text-xs bg-gray-50 p-2 rounded border">
            <div className="font-medium text-gray-700">Quick time</div>
            <div className="text-gray-500">1 | 23 | 456</div>
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded border">
            <div className="font-medium text-gray-700">Just seconds</div>
            <div className="text-gray-500">0 | 45 | 123</div>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const SubmitTimeModal: React.FC<SubmitTimeModalProps> = ({
  isOpen,
  onClose,
  defaultTrack,
}) => {
  const queryClient = useQueryClient();

  // Fetch all tracks for the dropdown
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const response = await apiClient.getTracks();
      return response.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SubmitTimeFormData>({
    resolver: zodResolver(submitTimeSchema),
    defaultValues: {
      trackId: defaultTrack?.id,
    },
  });

  const submitTimeMutation = useMutation({
    mutationFn: async (data: SubmitTimeFormData) => {
      const timeInMs = parseTime(data.time);
      const trackId = data.trackId || defaultTrack?.id;

      if (!trackId) {
        throw new Error("No track selected");
      }

      return apiClient.submitScore({
        trackId,
        time: timeInMs,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "weekly-challenge"],
      });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to submit time:", error);
    },
  });

  const onSubmit = (data: SubmitTimeFormData) => {
    submitTimeMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 !p-6">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Submit New Time
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Track Selection (only show if no default track) */}
            {!defaultTrack && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Track</label>
                <select
                  {...register("trackId")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-800 text-white"
                  style={{
                    backgroundColor: "#1f2937",
                    color: "white",
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#1f2937", color: "white" }}
                  >
                    Choose a track...
                  </option>
                  {tracksData?.map((track) => (
                    <option
                      key={track.id}
                      value={track.id}
                      style={{ backgroundColor: "#1f2937", color: "white" }}
                    >
                      {track.name}
                    </option>
                  ))}
                </select>
                {errors.trackId && (
                  <p className="text-red-500 text-sm">
                    {errors.trackId.message}
                  </p>
                )}
              </div>
            )}

            {/* Time Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </label>
              <SmartTimeInput
                value={watch("time") || ""}
                onChange={(value) => {
                  // Update the form field
                  const event = {
                    target: { name: "time", value },
                  } as React.ChangeEvent<HTMLInputElement>;
                  register("time").onChange(event);
                }}
                error={errors.time?.message}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-sm sm:text-base"
            >
              {isSubmitting ? "Submitting..." : "Submit Time"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
