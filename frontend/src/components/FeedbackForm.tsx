import React, { useState, useEffect, useCallback } from 'react';
import { collectSignals } from '../utils/signals';
import { analyzeSentiment, SentimentResult } from '../utils/sentiment';
import { Sparkles, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface FormConfig {
  form_version: string;
  fields: string[];
  max_fields: number;
}

interface FormState {
  [key: string]: string;
}

interface Props {
  userId: string;
}

interface FeedbackFormProps extends Props {
  horizontal?: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ userId, horizontal }) => {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<FormState>({});
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Phase 1: User Arrives - Fetch form configuration
  useEffect(() => {
    const fetchConfig = async () => {
      const signals = collectSignals();
      try {
        const response = await fetch('/api/classify-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signals, user_id: userId }),
        });
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        // Fallback for demo
        setConfig({
          form_version: 'simple',
          fields: ['overall_rating', 'what_did_you_like', 'suggestions'],
          max_fields: 3,
        });
      }
    };
    fetchConfig();
  }, []);

  // Phase 2: Real-time sentiment detection
  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'what_did_you_like' || field === 'what_went_wrong' || field === 'suggestions') {
      const result = await analyzeSentiment(value);
      setSentiment(result);
    }
  };

  // Dynamic fields based on sentiment
  const getDynamicFields = useCallback(() => {
    if (!config) return [];
    let fields = [...config.fields];

    if (sentiment) {
      if (sentiment.sentiment === 'NEGATIVE' && sentiment.score > 0.6) {
        if (!fields.includes('what_went_wrong')) fields.push('what_went_wrong');
        if (!fields.includes('how_can_we_fix_this')) fields.push('how_can_we_fix_this');
        fields = fields.filter(f => f !== 'would_you_recommend_us');
      } else if (sentiment.sentiment === 'POSITIVE' && sentiment.score > 0.6) {
        if (!fields.includes('what_do_you_love_most')) fields.push('what_do_you_love_most');
        if (!fields.includes('would_you_refer_a_friend')) fields.push('would_you_refer_a_friend');
        fields = fields.filter(f => f !== 'what_went_wrong');
      }
    }

    // Abandonment Risk Intervention
    if (riskScore > 0.7) {
        return fields.slice(0, 1); // Shorten to 1 field
    }

    return fields;
  }, [config, sentiment, riskScore]);

  // Phase 2: Abandonment Risk Monitor
  useEffect(() => {
    const interval = setInterval(() => {
      const signals = collectSignals();
      const filledFields = Object.keys(formData).length;
      const totalFields = config?.fields.length || 3;
      
      let score = 0;
      if (signals.timeOnPage > 45 && filledFields / totalFields < 0.5) score += 0.4;
      if (signals.scrollDepth > 80 && filledFields === 0) score += 0.4;

      setRiskScore(score);
    }, 10000);
    return () => clearInterval(interval);
  }, [formData, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const signals = collectSignals();

    try {
      await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_type: 'unknown',
          sentiment: sentiment?.sentiment || 'neutral',
          fields_filled: Object.values(formData).filter(v => v.trim() !== '').length,
          responses: formData,
          time_spent: signals.timeOnPage,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed', error);
      setSubmitted(true); // Still set for demo purposes
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config || !config.fields) return <div className="text-[#1f2a1d] text-sm font-medium">Loading form...</div>;
  if (submitted) return (
    <div className={`bg-white/80 backdrop-blur-md rounded-xl border border-white/40 flex items-center gap-3 ${horizontal ? 'px-4 py-2' : 'p-6 text-center flex-col'}`}>
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <p className="text-sm font-bold text-[#1f2a1d]">Thank You!</p>
          {!horizontal && <p className="text-xs text-[#4b5b47]">Feedback received.</p>}
        </div>
    </div>
  );

  const fieldsToRender = getDynamicFields();

  return (
    <div className={`${horizontal ? 'w-full' : 'bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-md mx-auto'} relative transition-all duration-500`}>
      {!horizontal && (
        <div className="flex items-center gap-2 text-heading-primary mb-6">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Share Your Feedback</h2>
        </div>
      )}

      {riskScore > 0.7 && !horizontal && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-semibold text-orange-800">Just one quick question!</p>
                <div className="w-full bg-orange-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-orange-500 h-full w-[85%] transition-all duration-1000" />
                </div>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${horizontal ? 'flex flex-row items-end gap-3' : 'space-y-4'}`}>
        {fieldsToRender.map(field => (
          <div key={field} className={horizontal ? 'flex-1' : ''}>
            {!horizontal && (
              <label className="block text-sm font-medium text-dark-green mb-1 capitalize">
                {field.replace(/_/g, ' ')}
              </label>
            )}
            {field === 'overall_rating' ? (
              <input
                type="number"
                min="1"
                max="5"
                className={`w-full px-3 py-2 rounded-lg border border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-heading-accent outline-none text-sm`}
                placeholder="Rating (1-5)"
                onChange={e => handleInputChange(field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg border border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-heading-accent outline-none text-sm`}
                placeholder={field.replace(/_/g, ' ')}
                onChange={e => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${horizontal ? 'px-4 py-2 h-[38px]' : 'w-full py-3'} bg-[#1f2a1d] hover:bg-[#2a3827] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shrink-0`}
        >
          {isSubmitting ? '...' : (
            <>
              {horizontal ? 'Send' : 'Submit'} <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {sentiment && !horizontal && (
          <div className={`mt-4 text-[10px] font-medium px-2 py-0.5 rounded inline-block ${
              sentiment.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800' : 
              sentiment.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
              {sentiment.sentiment} ({Math.round(sentiment.score * 100)}%)
          </div>
      )}
    </div>
  );
};

export default FeedbackForm;
