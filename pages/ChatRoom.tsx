
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ChatMessage, WalkRequest, WalkStatus } from '../types.ts';
import { supabase } from '../supabase.ts';

interface Props {
  user: User;
}

const ChatRoom: React.FC<Props> = ({ user }) => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [request, setRequest] = useState<WalkRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requestId) return;

    const fetchData = async () => {
      try {
        // 1. 산책 공고 정보 가져오기
        const { data: reqData, error: reqError } = await supabase
          .from('walk_requests')
          .select('*, dogs(*)')
          .eq('id', requestId)
          .single();

        if (reqError) throw reqError;
        setRequest(reqData);

        // 2. 기존 메시지 가져오기
        const { data: msgData, error: msgError } = await supabase
          .from('chat_messages')
          .select('*, sender:profiles(id, nickname)')
          .eq('request_id', requestId)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;
        setMessages(msgData || []);
      } catch (err) {
        console.error('Fetch error:', err);
        alert('채팅방 정보를 불러오지 못했습니다.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. 실시간 구독 설정
    const channel = supabase
      .channel(`chat:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `request_id=eq.${requestId}`
        },
        async (payload) => {
          // 보낸 사람 프로필 정보와 함께 새 메시지 업데이트
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, nickname')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessageObj: ChatMessage = {
            id: payload.new.id,
            requestId: payload.new.request_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
            sender: senderProfile as any
          };

          setMessages(prev => [...prev, newMessageObj]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, navigate]);

  // 새 메시지가 올 때마다 스크롤 하단 이동
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !requestId) return;

    try {
      const content = newMessage.trim();
      setNewMessage(''); // 보낸 즉시 입력창 비우기

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          request_id: requestId,
          sender_id: user.id,
          content: content
        });

      if (error) throw error;
    } catch (err: any) {
      alert('메시지 전송 실패: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold">채팅방에 연결 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="bg-white p-4 rounded-t-3xl border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0 border border-slate-100">
              {request?.dogs?.image_url ? <img src={request.dogs.image_url} className="w-full h-full object-cover" /> : '🐶'}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">{request?.dogs?.name} 산책 채팅</h2>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{request?.region} · {request?.duration}분</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-2">
            <i className="fas fa-comments text-4xl"></i>
            <p className="text-sm font-bold">대화를 시작해보세요!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">
                      {msg.sender?.nickname || '알 수 없음'}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-300 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-slate-100 rounded-b-3xl shrink-0 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-sm transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
