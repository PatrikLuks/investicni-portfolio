"""
Portfolio Manager - TOP LEVEL UPGRADE
Python Script for Automated Progress Tracking
"""

import json
from datetime import datetime
from typing import Dict, List

class RoadmapTracker:
    def __init__(self, roadmap_file='TOP_LEVEL_ROADMAP.json'):
        with open(roadmap_file, 'r', encoding='utf-8') as f:
            self.roadmap = json.load(f)
        
        self.completed = []
        self.in_progress = []
        self.pending = []
        
    def get_all_items(self) -> List[Dict]:
        """Extract all items from all tiers"""
        items = []
        for tier_key in ['tier1', 'tier2', 'tier3', 'tier4', 'tier5']:
            if tier_key in self.roadmap['tiers']:
                tier = self.roadmap['tiers'][tier_key]
                for item in tier['items']:
                    item['tier'] = tier['name']
                    items.append(item)
        return items
    
    def mark_completed(self, item_id: str):
        """Mark an item as completed"""
        if item_id not in self.completed:
            self.completed.append(item_id)
            if item_id in self.in_progress:
                self.in_progress.remove(item_id)
        self.save_progress()
    
    def mark_in_progress(self, item_id: str):
        """Mark an item as in progress"""
        if item_id not in self.in_progress and item_id not in self.completed:
            self.in_progress.append(item_id)
        self.save_progress()
    
    def get_progress_report(self) -> Dict:
        """Generate progress report"""
        all_items = self.get_all_items()
        total = len(all_items)
        completed = len(self.completed)
        in_progress = len(self.in_progress)
        pending = total - completed - in_progress
        
        return {
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'pending': pending,
            'completion_percentage': (completed / total * 100) if total > 0 else 0,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_next_tasks(self, limit=5) -> List[Dict]:
        """Get next priority tasks"""
        all_items = self.get_all_items()
        pending_items = [
            item for item in all_items 
            if item['id'] not in self.completed and item['id'] not in self.in_progress
        ]
        # Sort by priority
        pending_items.sort(key=lambda x: x['priority'])
        return pending_items[:limit]
    
    def save_progress(self):
        """Save progress to file"""
        progress = {
            'completed': self.completed,
            'in_progress': self.in_progress,
            'last_updated': datetime.now().isoformat()
        }
        with open('progress.json', 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=2, ensure_ascii=False)
    
    def load_progress(self):
        """Load progress from file"""
        try:
            with open('progress.json', 'r', encoding='utf-8') as f:
                progress = json.load(f)
                self.completed = progress.get('completed', [])
                self.in_progress = progress.get('in_progress', [])
        except FileNotFoundError:
            pass
    
    def generate_report(self) -> str:
        """Generate detailed text report"""
        report = []
        report.append("=" * 80)
        report.append("PORTFOLIO MANAGER - TOP LEVEL UPGRADE PROGRESS")
        report.append("=" * 80)
        report.append("")
        
        progress = self.get_progress_report()
        report.append(f"📊 Overall Progress: {progress['completion_percentage']:.1f}%")
        report.append(f"✅ Completed: {progress['completed']}/{progress['total']}")
        report.append(f"🔄 In Progress: {progress['in_progress']}/{progress['total']}")
        report.append(f"⏳ Pending: {progress['pending']}/{progress['total']}")
        report.append("")
        
        # Tier breakdown
        report.append("📋 Tier Breakdown:")
        report.append("-" * 80)
        for tier_key in ['tier1', 'tier2', 'tier3', 'tier4', 'tier5']:
            if tier_key in self.roadmap['tiers']:
                tier = self.roadmap['tiers'][tier_key]
                tier_items = tier['items']
                tier_completed = sum(1 for item in tier_items if item['id'] in self.completed)
                tier_total = len(tier_items)
                percentage = (tier_completed / tier_total * 100) if tier_total > 0 else 0
                
                report.append(f"{tier['name']}: {tier_completed}/{tier_total} ({percentage:.0f}%)")
        
        report.append("")
        report.append("🎯 Next Priority Tasks:")
        report.append("-" * 80)
        
        next_tasks = self.get_next_tasks(5)
        for i, task in enumerate(next_tasks, 1):
            report.append(f"{i}. [{task['id']}] {task['name']}")
            report.append(f"   Tier: {task['tier']}")
            report.append(f"   Time: {task['estimatedTime']}")
            report.append(f"   Complexity: {task['complexity']}")
            report.append("")
        
        report.append("=" * 80)
        report.append(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def export_gantt_data(self) -> Dict:
        """Export data for Gantt chart visualization"""
        all_items = self.get_all_items()
        gantt_data = []
        
        for item in all_items:
            status = 'completed' if item['id'] in self.completed else \
                    'in_progress' if item['id'] in self.in_progress else 'pending'
            
            gantt_data.append({
                'id': item['id'],
                'name': item['name'],
                'tier': item['tier'],
                'duration': item['estimatedTime'],
                'priority': item['priority'],
                'complexity': item['complexity'],
                'status': status
            })
        
        return {
            'tasks': gantt_data,
            'metadata': self.get_progress_report()
        }


def main():
    """Main function for CLI usage"""
    tracker = RoadmapTracker()
    tracker.load_progress()
    
    print(tracker.generate_report())
    
    # Save Gantt data
    gantt_data = tracker.export_gantt_data()
    with open('gantt_data.json', 'w', encoding='utf-8') as f:
        json.dump(gantt_data, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Gantt data exported to gantt_data.json")


if __name__ == '__main__':
    main()
