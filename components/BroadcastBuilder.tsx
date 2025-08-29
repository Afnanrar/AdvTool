import React, { useState, useMemo, useEffect } from 'react';
import { MessageTag, FacebookPage, Broadcast } from '../types';
import TagSelector from './TagSelector';
import BroadcastHistory from './BroadcastHistory';
import DateTimePicker from './DateTimePicker';
import { useNotification } from '../contexts/NotificationContext';
import LoadTemplateModal from './modals/LoadTemplateModal';

interface BroadcastBuilderProps {
    // Fix: Changed type from FacebookPage to a more generic object shape
    // to accommodate both FacebookPage and ConnectedPageInfo types which share these properties.
    page: { id: string; name: string; };
    broadcasts: Broadcast[];
    onCancelBroadcast: (broadcastId: string) => void;
    onCreateBroadcast: (data: Omit<Broadcast, 'id' | 'pageId' | 'status' | 'progress' | 'totalRecipients' | 'sentCount' | 'timeSpent' | 'userId' | 'isTemplate' | 'analytics'>) => Promise<void>;
    onCreateTemplate: (campaignName: string, message: string) => Promise<void>;
    onFetchTemplates: () => Promise<Broadcast[]>;
}

type Audience = 'all' | 'active_24h' | 'inactive_24h' | 'vip';
type ActiveTab = 'builder' | 'history';

const TabButton: React.FC<{label: string, active: boolean, onClick: ()=>void}> = ({label, active, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
    >{label}</button>
)

const BroadcastBuilder: React.FC<BroadcastBuilderProps> = ({ page, broadcasts, onCancelBroadcast, onCreateBroadcast, onCreateTemplate, onFetchTemplates }) => {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<ActiveTab>('builder');
    const [campaignName, setCampaignName] = useState('');
    const [audience, setAudience] = useState<Audience>('all');
    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState<MessageTag | null>(null);
    const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
    const [scheduleDateTime, setScheduleDateTime] = useState('');
    const [dryRunResults, setDryRunResults] = useState<{ inside24h: number, outside24h: number, total: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    useEffect(() => {
        if (campaignName) {
            const isDuplicate = broadcasts.some(
                b => b.pageId === page.id && b.campaignName.toLowerCase() === campaignName.toLowerCase().trim()
            );
            if (isDuplicate) {
                setNameError('A campaign with this name already exists for this page.');
            } else {
                setNameError(null);
            }
        } else {
            setNameError(null);
        }
    }, [campaignName, page.id, broadcasts]);

    const isTagRequired = useMemo(() => ['all', 'inactive_24h', 'vip'].includes(audience), [audience]);
    
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update 'now' every minute
        return () => clearInterval(timer);
    }, []);

    const isFormValid = useMemo(() => {
        if (!campaignName.trim() || !message.trim() || nameError) return false;
        if (isTagRequired && !selectedTag) return false;
        if (scheduleOption === 'later' && !scheduleDateTime) return false;
        if (scheduleOption === 'later' && new Date(scheduleDateTime) < now) return false;
        return true;
    }, [campaignName, message, nameError, isTagRequired, selectedTag, scheduleOption, scheduleDateTime, now]);
        
    const handleDryRun = () => {
        const total = Math.floor(Math.random() * 5000) + 1000;
        let inside24h = (audience === 'active_24h') ? total : (audience === 'inactive_24h') ? 0 : Math.floor(Math.random() * total);
        setDryRunResults({ inside24h, outside24h: total - inside24h, total });
    };
    
    const handleSaveTemplate = async () => {
        if (!campaignName.trim() || !message.trim()) {
            showNotification({ message: 'Campaign name and message are required to save a template.', type: 'error' });
            return;
        }
        await onCreateTemplate(campaignName.trim(), message.trim());
    };
    
    const handleLoadTemplate = (template: Broadcast) => {
        setCampaignName(`${template.campaignName} (Copy)`);
        setMessage(template.message);
        setIsTemplateModalOpen(false);
        showNotification({ message: `Loaded template: ${template.campaignName}`, type: 'info' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            showNotification({ message: "Please fill all required fields and fix any errors.", type: 'error'});
            return;
        }
        setIsSubmitting(true);

        const newBroadcastData = {
            campaignName: campaignName.trim(), audience, message: message.trim(), tag: selectedTag,
            scheduledAt: scheduleOption === 'later' ? new Date(scheduleDateTime).toISOString() : new Date().toISOString(),
        };

        try {
            await onCreateBroadcast(newBroadcastData);
            setCampaignName(''); setAudience('all'); setMessage(''); setSelectedTag(null);
            setScheduleOption('now'); setScheduleDateTime(''); setDryRunResults(null);
            setActiveTab('history');
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 p-6 overflow-y-auto">
            {isTemplateModalOpen && (
                <LoadTemplateModal
                    onClose={() => setIsTemplateModalOpen(false)}
                    onLoadTemplate={handleLoadTemplate}
                    fetchTemplates={onFetchTemplates}
                />
            )}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Broadcasts</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Creating campaign for <span className="font-semibold text-slate-700 dark:text-slate-200">{page.name}</span></p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <TabButton label="Create Broadcast" active={activeTab === 'builder'} onClick={() => setActiveTab('builder')} />
                    <TabButton label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>
            </div>
            
            {activeTab === 'builder' ? (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto w-full">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="campaignName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Campaign Name</label>
                                <input type="text" id="campaignName" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                                    className={`w-full bg-slate-200 dark:bg-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${nameError ? 'ring-red-500' : 'focus:ring-blue-500'}`}
                                    placeholder="e.g., Summer Sale Announcement"
                                />
                                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                            </div>
                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audience</label>
                                <select id="audience" value={audience} onChange={e => { setAudience(e.target.value as Audience); setDryRunResults(null); }}
                                    className="w-full bg-slate-200 dark:bg-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Subscribers</option>
                                    <option value="active_24h">Active in last 24h</option>
                                    <option value="inactive_24h">Inactive for 24h+</option>
                                    <option value="vip">Label: VIP</option>
                                </select>
                                <div className="mt-2 flex items-center justify-between">
                                    <button type="button" onClick={handleDryRun} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Calculate Recipients</button>
                                    {dryRunResults && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 animate-fade-in">
                                            Est. Recipients: <span className="font-bold">{dryRunResults.total.toLocaleString()}</span> ({dryRunResults.outside24h.toLocaleString()} require a tag)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-lg font-semibold mb-4">Message</h2>
                         {isTagRequired && (
                            <div className="mb-4">
                                <TagSelector selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                            </div>
                        )}
                        <textarea value={message} onChange={e => setMessage(e.target.value)}
                            className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message here. Use {{first_name}} for personalization."
                        />
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center space-x-2">
                                <button type="button" onClick={() => setIsTemplateModalOpen(true)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Load from Template</button>
                                <button type="button" onClick={handleSaveTemplate} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Save as Template</button>
                            </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400">{message.length} / 2000</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-lg font-semibold mb-4">Scheduling</h2>
                        <div className="flex items-start space-x-6">
                            <div className="flex items-center">
                                <input type="radio" id="sendNow" name="scheduleOption" value="now" checked={scheduleOption === 'now'} onChange={() => {
                                    setScheduleOption('now');
                                    setScheduleDateTime('');
                                }} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                                <label htmlFor="sendNow" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Send Now</label>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center mb-2">
                                    <input type="radio" id="sendLater" name="scheduleOption" value="later" checked={scheduleOption === 'later'} onChange={() => setScheduleOption('later')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                                    <label htmlFor="sendLater" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Schedule for Later</label>
                                </div>
                                {scheduleOption === 'later' && (
                                    <div className="pl-6 animate-fade-in">
                                        <DateTimePicker value={scheduleDateTime} onChange={setScheduleDateTime} minDateTime={now} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={!isFormValid || isSubmitting}
                            className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Scheduling...' : (scheduleOption === 'now' ? 'Send Broadcast Now' : 'Schedule Broadcast')}
                        </button>
                    </div>
                </form>
            ) : (
                <BroadcastHistory broadcasts={broadcasts} onCancelBroadcast={onCancelBroadcast} />
            )}
        </main>
    );
};

export default BroadcastBuilder;