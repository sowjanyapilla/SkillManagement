import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, ChevronDown, Star } from 'lucide-react';
import { User, SkillSubmission } from '../types';

interface ApprovalsTabProps {
  user: User;
}

interface ApprovalAction {
  submissionId: string;
  action: 'approve' | 'reject';
  proficiency?: number;
  comments?: string;
}

export default function ApprovalsTab({ user }: ApprovalsTabProps) {
  const [pendingApprovals, setPendingApprovals] = useState<SkillSubmission[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actions, setActions] = useState<Record<string, ApprovalAction>>({});

  // Mock data for demonstration - only show if user is a manager
  useEffect(() => {
    if (user.is_manager) {
      const mockApprovals: SkillSubmission[] = [
        {
          id: '1',
          user_id: 'user-2',
          skill_name: 'Angular Development',
          sub_skills: [
            { name: 'Angular Components', proficiency: 4, experience: 2.0, hasCertification: true },
            { name: 'RxJS', proficiency: 3, experience: 1.5, hasCertification: false },
          ],
          status: 'pending',
          submitted_at: '2024-01-22T10:00:00Z',
        },
        {
          id: '2',
          user_id: 'user-3',
          skill_name: 'DevOps',
          sub_skills: [
            { name: 'Docker', proficiency: 5, experience: 3.5, hasCertification: true },
            { name: 'Kubernetes', proficiency: 4, experience: 2.8, hasCertification: true },
          ],
          status: 'pending',
          submitted_at: '2024-01-23T14:30:00Z',
        },
      ];
      setPendingApprovals(mockApprovals);
    }
  }, [user.is_manager]);

  const toggleRowExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedRows(newExpanded);
  };

  const updateAction = (submissionId: string, updates: Partial<ApprovalAction>) => {
    setActions(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], ...updates }
    }));
  };

  const handleApproval = (submissionId: string, action: 'approve' | 'reject') => {
    const actionData = actions[submissionId];
    
    // Update the submission status
    setPendingApprovals(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: action === 'approve' ? 'approved' : 'rejected', manager_comments: actionData?.comments }
          : submission
      )
    );

    // Clear the action data
    setActions(prev => {
      const newActions = { ...prev };
      delete newActions[submissionId];
      return newActions;
    });

    // In a real app, this would make an API call
    console.log(`${action} submission ${submissionId}`, actionData);
  };

  const renderStars = (proficiency: number, onChange?: (value: number) => void) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`focus:outline-none ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              star <= proficiency 
                ? 'text-yellow-400 fill-current' 
                : onChange 
                  ? 'text-gray-300 hover:text-yellow-200' 
                  : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

  if (!user.is_manager) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Manager access required</p>
          <p className="text-sm">Only managers can view skill approvals.</p>
        </div>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Check className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No approvals found</p>
          <p className="text-sm">All skill submissions have been reviewed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Skill Approvals</h2>
        <span className="text-sm text-gray-600">
          {pendingApprovals.filter(s => s.status === 'pending').length} pending reviews
        </span>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingApprovals.map((submission) => (
                <React.Fragment key={submission.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Employee #{submission.user_id.slice(-3)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.skill_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {submission.sub_skills.map(sub => sub.name).join(', ')}
                      </div>
                      <button
                        onClick={() => toggleRowExpansion(submission.id)}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View Details
                        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${expandedRows.has(submission.id) ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(submission.id, 'approve')}
                            className="flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(submission.id, 'reject')}
                            className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {expandedRows.has(submission.id) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Sub-skill Details</h4>
                          
                          {submission.sub_skills.map((subSkill, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Sub-skill
                                  </label>
                                  <p className="text-sm text-gray-900">{subSkill.name}</p>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Current Proficiency
                                  </label>
                                  <div className="flex items-center">
                                    {renderStars(subSkill.proficiency)}
                                    <span className="ml-2 text-xs text-gray-600">({subSkill.proficiency}/5)</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Experience
                                  </label>
                                  <p className="text-sm text-gray-900">{subSkill.experience} years</p>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Certification
                                  </label>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    subSkill.hasCertification ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {subSkill.hasCertification ? 'Yes' : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              {submission.status === 'pending' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Modify Proficiency (Optional)
                                      </label>
                                      {renderStars(
                                        actions[submission.id]?.proficiency || subSkill.proficiency,
                                        (value) => updateAction(submission.id, { submissionId: submission.id, action: 'approve', proficiency: value })
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {submission.status === 'pending' && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments (Optional)
                              </label>
                              <textarea
                                value={actions[submission.id]?.comments || ''}
                                onChange={(e) => updateAction(submission.id, { submissionId: submission.id, action: 'approve', comments: e.target.value })}
                                placeholder="Add any comments about this skill submission..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}