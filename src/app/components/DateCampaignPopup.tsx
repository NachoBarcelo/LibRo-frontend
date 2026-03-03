import { useEffect, useMemo, useState } from 'react';
import { DATE_CAMPAIGNS, DateCampaign } from '../config/dateCampaigns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';

const STORAGE_PREFIX = 'date-campaign-seen:';
const DEFAULT_TIMEZONE = 'America/Bogota';

interface TodayParts {
  year: number;
  month: number;
  day: number;
  isoDate: string;
}

function parseIsoDate(isoDate: string): TodayParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return {
    year,
    month,
    day,
    isoDate
  };
}

function getTodayInTimezone(timeZone: string): TodayParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0');

  return {
    year,
    month,
    day,
    isoDate: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

function isCampaignActive(campaign: DateCampaign, today: TodayParts): boolean {
  if (campaign.rule.type === 'MONTHLY_DAY') {
    return today.day === campaign.rule.day;
  }

  return today.month === campaign.rule.month && today.day === campaign.rule.day;
}

function getSeenStorageKey(campaignKey: string, occurrenceDate: string): string {
  return `${STORAGE_PREFIX}${campaignKey}:${occurrenceDate}`;
}

function isCampaignSeen(campaignKey: string, occurrenceDate: string): boolean {
  try {
    return window.localStorage.getItem(getSeenStorageKey(campaignKey, occurrenceDate)) === '1';
  } catch {
    return false;
  }
}

function markCampaignSeen(campaignKey: string, occurrenceDate: string): void {
  try {
    window.localStorage.setItem(getSeenStorageKey(campaignKey, occurrenceDate), '1');
  } catch {
    return;
  }
}

function readPopupDebugParams() {
  if (typeof window === 'undefined') {
    return { previewAll: false, forcedDate: null as TodayParts | null };
  }

  const params = new URLSearchParams(window.location.search);
  const previewAll = params.get('campaignPreview') === 'all';
  const forcedDateRaw = params.get('campaignDate');
  const forcedDate = forcedDateRaw ? parseIsoDate(forcedDateRaw) : null;

  return { previewAll, forcedDate };
}

export function DateCampaignPopup() {
  const [open, setOpen] = useState(false);
  const [activeCampaignKey, setActiveCampaignKey] = useState<string | null>(null);
  const [activeOccurrenceDate, setActiveOccurrenceDate] = useState<string | null>(null);
  const [previewQueue, setPreviewQueue] = useState<string[]>([]);

  const campaignsByPriority = useMemo(
    () => DATE_CAMPAIGNS.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    []
  );

  const activeCampaign = useMemo(
    () => DATE_CAMPAIGNS.find((campaign) => campaign.key === activeCampaignKey) ?? null,
    [activeCampaignKey]
  );

  useEffect(() => {
    const { previewAll, forcedDate } = readPopupDebugParams();
    const today = forcedDate ?? getTodayInTimezone(DEFAULT_TIMEZONE);

    if (previewAll) {
      const allKeys = campaignsByPriority.map((campaign) => campaign.key);
      if (allKeys.length === 0) {
        return;
      }

      setPreviewQueue(allKeys);
      setActiveCampaignKey(allKeys[0]);
      setActiveOccurrenceDate(today.isoDate);
      setOpen(true);
      return;
    }

    const campaignToShow = campaignsByPriority.find((campaign) => {
      if (!isCampaignActive(campaign, today)) {
        return false;
      }

      return !isCampaignSeen(campaign.key, today.isoDate);
    });

    if (!campaignToShow) {
      return;
    }

    setActiveCampaignKey(campaignToShow.key);
    setActiveOccurrenceDate(today.isoDate);
    setOpen(true);
  }, [campaignsByPriority]);

  const handleClose = () => {
    const { previewAll } = readPopupDebugParams();

    if (previewAll && activeCampaignKey) {
      const currentIndex = previewQueue.findIndex((campaignKey) => campaignKey === activeCampaignKey);
      const nextCampaignKey = currentIndex >= 0 ? previewQueue[currentIndex + 1] : undefined;

      if (nextCampaignKey) {
        setActiveCampaignKey(nextCampaignKey);
        setOpen(true);
        return;
      }

      setOpen(false);
      return;
    }

    if (activeCampaign && activeOccurrenceDate) {
      markCampaignSeen(activeCampaign.key, activeOccurrenceDate);
    }

    setOpen(false);
  };

  if (!activeCampaign) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : handleClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeCampaign.title}</DialogTitle>
          <DialogDescription>{activeCampaign.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            {activeCampaign.buttonText ?? 'Cerrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
