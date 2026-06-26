import { Component } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center h-full text-center">
      <svg class="w-24 h-24 text-indigo-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
      <p class="text-gray-500 max-w-md">We are working hard to bring this feature to life. Check back later to see what we've built!</p>
    </div>
  `
})
export class ComingSoonComponent {}
