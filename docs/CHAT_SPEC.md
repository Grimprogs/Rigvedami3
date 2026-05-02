# Chat & Notification System Specification

This document outlines the architecture for real-time communication and "Approval-by-Chat" workflows in ZTasks.

## 1. Overview
The goal is to move beyond static task updates by enabling real-time collaboration. Employees can send messages, attach proof (screenshots), and Admins can approve tasks directly from the chat interface.

## 2. Infrastructure
- **Real-time Messaging**: Supabase Realtime (WebSockets) for instant message delivery.
- **Media Storage**: **AWS S3** for handling high-resolution screenshots and task attachments (bypasses standard DB limits).
- **Notifications**: Web Notifications API (Browser Push) for background alerts.

## 3. Database Schema: `messages`
```sql
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null, -- formatted as "task:id" or "dept:id"
  sender_id uuid references auth.users not null,
  content text,
  attachment_url text, -- Points to AWS S3
  is_approval_request boolean default false,
  created_at timestamp with time zone default now()
);
```

## 4. "Approval-by-Chat" Workflow
1. **Request**: Employee sends a message with `is_approval_request = true`.
2. **Alert**: Admin receives a browser notification.
3. **Action**: Admin sees an "Approve / Reject" button directly in the chat bubble.
4. **Impact**: Clicking "Approve" triggers a database transaction that:
   - Updates the Message status.
   - Sets the Task status to `completed`.
   - Records the `approved_at` timestamp.

## 5. Security
- **RLS**: Users can only read messages for chats they are a part of (enforced by Department Hierarchy).
- **Integrity**: Only Admins can trigger the "Approve" transaction.
