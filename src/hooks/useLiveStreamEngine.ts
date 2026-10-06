import { useEffect, useRef } from 'react';
import { useAMLStore } from '../store/useAMLStore';
import { synthesizeLiveTransaction } from '../data/mockSeed';

export function useLiveStreamEngine() {
  const isLiveStreaming = useAMLStore((s) => s.isLiveStreaming);
  const liveSeqRef = useRef(200);

  useEffect(() => {
    if (!isLiveStreaming) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Randomized interval between 1.5s and 3.0s
      const delay = Math.floor(1500 + Math.random() * 1500);

      timeoutId = setTimeout(() => {
        liveSeqRef.current += 1;
        const newTxn = synthesizeLiveTransaction(liveSeqRef.current);

        useAMLStore.setState((state) => {
          const nextTransactions = [newTxn, ...state.transactions.slice(0, 2400)];
          const isFlagged = newTxn.riskScore >= 70;

          // Determine which agent should pulse
          const nextAgents = state.agentStatuses.map((agent) => {
            let firing = false;
            if (newTxn.typology === 'structuring' && agent.name.includes('Structuring')) {
              firing = true;
            } else if (newTxn.typology === 'cyclic_flow' && agent.name.includes('Cycle')) {
              firing = true;
            } else if (newTxn.typology === 'mule_fan' && agent.name.includes('Mule')) {
              firing = true;
            } else if (isFlagged && agent.name.includes('Sanctions') && newTxn.sanctionsCheck.ofacMatch) {
              firing = true;
            }
            return {
              ...agent,
              isFiring: firing || (Math.random() < 0.12),
              activeCount: firing ? agent.activeCount + 1 : agent.activeCount,
              lastFired: firing ? 'Just now' : agent.lastFired
            };
          });

          const nextNotifications = isFlagged 
            ? [newTxn, ...state.notifications.slice(0, 15)] 
            : state.notifications;

          const openCases = nextTransactions.filter(
            t => t.riskScore >= 70 && (t.status === 'New' || t.status === 'Under Review')
          ).length;

          const nextKPIs = {
            ...state.liveKPIs,
            transactionsPerMin: Math.round(1415 + Math.random() * 25),
            flaggedToday: isFlagged ? state.liveKPIs.flaggedToday + 1 : state.liveKPIs.flaggedToday,
            openCases,
            totalVolume24h: state.liveKPIs.totalVolume24h + newTxn.amount
          };

          return {
            transactions: nextTransactions,
            agentStatuses: nextAgents,
            liveAlertTicker: isFlagged ? newTxn : state.liveAlertTicker,
            notifications: nextNotifications,
            unreadAlertCount: isFlagged ? state.unreadAlertCount + 1 : state.unreadAlertCount,
            liveKPIs: nextKPIs
          };
        });

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [isLiveStreaming]);
}
