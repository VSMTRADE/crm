import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { differenceInDays, isPast, parseISO } from 'date-fns';
import { AccessTime as TimeIcon, Warning as WarningIcon } from '@mui/icons-material';

interface TaskDeadlineProps {
  dueDate: string;
  showFullInfo?: boolean;
}

const TaskDeadline: React.FC<TaskDeadlineProps> = ({ dueDate, showFullInfo = false }) => {
  const today = new Date();
  const dueDateObj = dueDate ? parseISO(dueDate) : null;
  const daysRemaining = dueDateObj ? differenceInDays(dueDateObj, today) : null;
  const isOverdue = dueDateObj ? isPast(dueDateObj) && daysRemaining !== 0 : false;

  const getDeadlineStatus = () => {
    if (!dueDateObj) {
      return {
        label: 'Sem Prazo',
        color: 'default' as const,
        icon: <TimeIcon />,
      };
    }
    if (isOverdue) {
      return {
        label: 'Atrasado',
        color: 'error' as const,
        icon: <WarningIcon />,
      };
    }
    if (daysRemaining === 0) {
      return {
        label: 'Vence Hoje',
        color: 'warning' as const,
        icon: <TimeIcon />,
      };
    }
    if (daysRemaining <= 3) {
      return {
        label: 'Próximo do Prazo',
        color: 'warning' as const,
        icon: <TimeIcon />,
      };
    }
    return {
      label: 'No Prazo',
      color: 'success' as const,
      icon: <TimeIcon />,
    };
  };

  const status = getDeadlineStatus();
  const daysText = !dueDateObj 
    ? 'Sem prazo definido'
    : isOverdue
    ? `${Math.abs(daysRemaining!)} dias atrasado`
    : daysRemaining === 0
    ? 'Vence hoje'
    : `${daysRemaining} dias restantes`;

  if (showFullInfo) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={status.icon}
          label={status.label}
          color={status.color}
          size="small"
        />
        <Typography variant="body2" color="textSecondary">
          {daysText}
        </Typography>
      </Box>
    );
  }

  return (
    <Tooltip title={daysText}>
      <Chip
        icon={status.icon}
        label={status.label}
        color={status.color}
        size="small"
      />
    </Tooltip>
  );
};

export default TaskDeadline;
