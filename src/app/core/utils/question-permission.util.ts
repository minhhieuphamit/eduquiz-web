import { QuestionResponse } from '../../models/question.model';

export interface QuestionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  isOwner: boolean;
  isShared: boolean;
  ownershipLabel: string;
  ownershipColor: string;
}

const NO_PERMISSIONS: QuestionPermissions = {
  canView: false, canEdit: false, canDelete: false, canShare: false,
  isOwner: false, isShared: false, ownershipLabel: '', ownershipColor: '',
};

export function getQuestionPermissions(
  question: QuestionResponse,
  role: string | null,
): QuestionPermissions {
  if (!role) return NO_PERMISSIONS;

  if (role === 'ADMIN') {
    return {
      canView: true, canEdit: true, canDelete: true,
      canShare: true,
      isOwner: false, isShared: false,
      ownershipLabel: '', ownershipColor: '',
    };
  }

  // BE tells us ownership via isOwner flag
  const isOwner = question.isOwner === true;
  if (isOwner) {
    return {
      canView: true, canEdit: true, canDelete: true,
      canShare: true,
      isOwner: true, isShared: false,
      ownershipLabel: 'Của tôi', ownershipColor: 'blue',
    };
  }

  // Shared recipient — view only
  return {
    canView: true, canEdit: false, canDelete: false,
    canShare: false,
    isOwner: false, isShared: true,
    ownershipLabel: 'Được chia sẻ', ownershipColor: 'orange',
  };
}
