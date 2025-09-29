export interface UserActivity {
  id: string;
  userId: string;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type ActivityAction =
  | 'created_project'
  | 'updated_project'
  | 'deleted_project'
  | 'duplicated_project'
  | 'updated_profile'
  | 'signed_in'
  | 'tried_demo'
  | 'exported_project'
  | 'used_template';

import { LucideIcon } from 'lucide-react';

export interface ActivityWithIcon extends UserActivity {
  icon: LucideIcon;
  displayText: string;
}

export const ACTIVITY_DISPLAY_CONFIG: Record<ActivityAction, {
  displayText: (details: string) => string;
  icon: string;
}> = {
  created_project: {
    displayText: (details) => `Created new project "${details}"`,
    icon: 'Plus'
  },
  updated_project: {
    displayText: (details) => `Updated project "${details}"`,
    icon: 'Edit'
  },
  deleted_project: {
    displayText: (details) => `Deleted project "${details}"`,
    icon: 'Trash2'
  },
  duplicated_project: {
    displayText: (details) => `Duplicated project "${details}"`,
    icon: 'Copy'
  },
  updated_profile: {
    displayText: (details) => details || 'Updated profile',
    icon: 'Settings'
  },
  signed_in: {
    displayText: () => 'Signed in to NexFlow',
    icon: 'LogIn'
  },
  tried_demo: {
    displayText: () => 'Tried interactive demo',
    icon: 'Star'
  },
  exported_project: {
    displayText: (details) => `Exported project "${details}"`,
    icon: 'Download'
  },
  used_template: {
    displayText: (details) => `Created project from template "${details}"`,
    icon: 'Folder'
  }
};