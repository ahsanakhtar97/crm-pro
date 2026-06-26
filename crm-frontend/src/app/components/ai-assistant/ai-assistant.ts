import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface Message { role: 'user' | 'assistant'; text: string; }

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page ai-page">
      <div class="page-header">
        <h1>AI Sales Assistant</h1>
        <span class="badge badge-ai">Powered by Groq</span>
      </div>
      <p class="ai-desc">Ask me anything about your pipeline, customers, or sales strategy. I have live access to your CRM data.</p>

      <div class="chat-window">
        <div *ngFor="let m of messages()" class="msg" [class.msg-user]="m.role==='user'" [class.msg-ai]="m.role==='assistant'">
          <div class="msg-bubble"><pre>{{m.text}}</pre></div>
        </div>
        <div *ngIf="loading()" class="msg msg-ai">
          <div class="msg-bubble thinking">Thinking...</div>
        </div>
        <div *ngIf="messages().length===0 && !loading()" class="chat-empty">
          <p>Try asking:</p>
          <div class="suggestions">
            <button class="suggestion" (click)="ask(s)" *ngFor="let s of suggestions">{{s}}</button>
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <textarea class="input chat-input" [value]="userInput()" (input)="userInput.set($any($event.target).value)"
          placeholder="Ask your AI sales assistant..." (keydown.enter)="send($event)"></textarea>
        <button class="btn btn-primary" (click)="send()" [disabled]="loading() || !userInput().trim()">Send</button>
      </div>
    </div>
  `
})
export class AiAssistantComponent {
  messages = signal<Message[]>([]);
  userInput = signal('');
  loading = signal(false);
  suggestions = [
    'Summarize my current pipeline',
    'Which deals are at risk?',
    'Draft a follow-up email for a prospect',
    'What should I focus on this week?',
    'How can I improve my close rate?'
  ];

  constructor(private api: ApiService) {}

  ask(text: string) { this.userInput.set(text); this.send(); }

  send(event?: Event) {
    if (event) {
      const ke = event as KeyboardEvent;
      if (ke.shiftKey) return;
      event.preventDefault();
    }
    const msg = this.userInput().trim();
    if (!msg || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', text: msg }]);
    this.userInput.set('');
    this.loading.set(true);

    this.api.chat(msg).subscribe({
      next: res => {
        this.messages.update(m => [...m, { role: 'assistant', text: res.reply }]);
        this.loading.set(false);
      },
      error: err => {
        const errMsg = err.error?.error ?? 'Failed to get response. Check your Groq API key in appsettings.json.';
        this.messages.update(m => [...m, { role: 'assistant', text: errMsg }]);
        this.loading.set(false);
      }
    });
  }
}
