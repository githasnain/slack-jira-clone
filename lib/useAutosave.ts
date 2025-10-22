import { useState, useEffect, useCallback, useRef } from 'react';

interface TicketData {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  channelId?: string;
  assigneeId?: string;
  dueDate?: string;
}

interface UseAutosaveOptions {
  data: TicketData;
  delay?: number;
  onSave?: (data: TicketData) => Promise<void>;
}

interface UseAutosaveReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

export function useAutosave({
  data,
  delay = 2000,
  onSave
}: UseAutosaveOptions): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousDataRef = useRef<TicketData>(data);

  const saveData = useCallback(async (dataToSave: TicketData) => {
    if (!dataToSave.title.trim()) {
      return; // Don't save empty tickets
    }

    setIsSaving(true);
    setError(null);

    try {
      if (onSave) {
        await onSave(dataToSave);
      } else {
        // Default API call
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSave,
            status: 'draft' // Always save as draft
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.statusText}`);
        }
      }

      setLastSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged && data.title.trim()) {
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        saveData(data);
        previousDataRef.current = data;
      }, delay);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, saveData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSavedAt,
    error
  };
}

