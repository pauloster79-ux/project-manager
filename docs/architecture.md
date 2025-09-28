# AI PM Hub - Application Architecture & Functionality

## Overview

AI PM Hub is a comprehensive project management application that combines traditional project management features with AI-powered validation, document processing, and contextual assistance. The application is built with Next.js 14, PostgreSQL with pgvector for semantic search, and integrates with multiple LLM providers for intelligent content validation and Q&A.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **UI Framework**: Tailwind CSS with Catalyst design system
- **Backend**: Next.js API routes with PostgreSQL
- **Database**: PostgreSQL with pgvector extension for semantic search
- **AI/LLM**: OpenAI GPT-4o-mini, Anthropic Claude, Azure OpenAI
- **Storage**: S3-compatible object storage (MinIO/AWS S3)
- **Background Jobs**: pg-boss for job queuing
- **Deployment**: Render.com with automatic deployments

### Database Schema

#### Core Entities
- **Organizations**: Multi-tenant organization management
- **Users**: User accounts with email and display names
- **Projects**: Project containers with name, description, and org scoping
- **Risks**: Risk management with probability, impact, exposure calculation
- **Decisions**: Decision tracking with status, approver, and rationale
- **Attachments**: File metadata linked to risks/decisions
- **Vectors**: Semantic embeddings for AI-powered search and Q&A

#### Multi-Tenancy
- **Organizations**: Top-level tenant isolation
- **Org Users**: Role-based access (owner, admin, member, viewer)
- **Invitations**: Email-based user invitations with tokens
- **Project Memberships**: Project-level roles (pm, member, viewer)

## Core Functionality

### 1. Project Management

#### Project Operations
- **Create/Edit Projects**: Full CRUD operations with org scoping
- **Project Listing**: Searchable, paginated project lists
- **Project Navigation**: Breadcrumb navigation and project switching
- **Access Control**: Role-based permissions (pm, member, viewer)

#### Project Structure
- **Overview**: Project summary and key metrics
- **Risks**: Risk register with exposure scoring
- **Decisions**: Decision log with approval workflow
- **Documents**: File attachments and document management
- **Q&A**: AI-powered contextual assistance

### 2. Risk Management

#### Risk Data Model
- **Core Fields**: Title, summary, owner, probability (1-5), impact (1-5)
- **Calculated Fields**: Exposure = probability × impact
- **Validation**: AI-powered validation with scoring (0-100)
- **Status Tracking**: Draft, valid, blocked states
- **Review Dates**: Next review date tracking

#### Risk Operations
- **Create/Edit Risks**: Full form-based editing with validation
- **Risk Listing**: Sortable table with exposure-based color coding
- **AI Validation**: Real-time validation on form blur
- **Issue Tracking**: Inline issue chips with severity indicators
- **Audit Trail**: Complete change history with actor tracking

#### AI-Powered Risk Validation
- **Deterministic Rules**: Business logic validation (required fields, date ranges)
- **LLM Analysis**: Content quality, coherence, and completeness assessment
- **Issue Detection**: Identifies missing information, contradictions, and improvements
- **Scoring System**: 0-100 validation score based on issue severity
- **Suggested Improvements**: AI-generated recommendations for risk enhancement

### 3. Decision Management

#### Decision Data Model
- **Core Fields**: Title, detail, status (Proposed/Approved/Rejected)
- **Approval Workflow**: Decided by user, decided on date
- **Validation**: AI-powered validation with scoring
- **Status Tracking**: Draft, valid, blocked states

#### Decision Operations
- **Create/Edit Decisions**: Full form-based editing with validation
- **Decision Listing**: Sortable table with status-based color coding
- **AI Validation**: Real-time validation on form blur
- **Issue Tracking**: Inline issue chips with severity indicators
- **Audit Trail**: Complete change history with actor tracking

#### AI-Powered Decision Validation
- **Deterministic Rules**: Business logic validation (required fields, status consistency)
- **LLM Analysis**: Content quality, rationale assessment, and completeness
- **Issue Detection**: Identifies missing information, unclear rationale, and improvements
- **Scoring System**: 0-100 validation score based on issue severity
- **Suggested Improvements**: AI-generated recommendations for decision enhancement

### 4. Document Management

#### Document Operations
- **Upload**: Pre-signed URL upload to S3-compatible storage
- **Commit**: Mark upload complete and enqueue processing
- **Text Extraction**: Automatic text extraction from supported formats
- **Chunking**: Intelligent text chunking for semantic search
- **Embedding**: Vector embeddings for semantic search and Q&A

#### Supported Formats
- **Text Files**: .txt, .md, .json with full text extraction
- **PDF Files**: Placeholder for future PDF text extraction
- **Metadata**: File size, MIME type, SHA256 checksum tracking

#### Background Processing
- **Worker System**: pg-boss job queue for document processing
- **Embedding Jobs**: Automatic vector embedding generation
- **Entity Embedding**: Risk and decision summarization and embedding
- **Error Handling**: Failed processing tracking and retry logic

### 5. AI-Powered Features

#### LLM Integration
- **Multiple Providers**: OpenAI, Anthropic, Azure OpenAI support
- **Model Selection**: GPT-4o-mini for completions, text-embedding-3-small for embeddings
- **JSON Mode**: Structured output for validation responses
- **Error Handling**: Graceful fallbacks and error recovery

#### Contextual Q&A System
- **Global Chat Dock**: Always-visible right-hand chat panel
- **Context Awareness**: Auto-scoping to current page (project/risk/decision)
- **Pre-filled Questions**: "Explain this..." buttons for quick assistance
- **Citation Support**: References to risks, decisions, and document snippets
- **Semantic Search**: Vector-based retrieval of relevant context

#### Retrieval Augmented Generation (RAG)
- **Context Packing**: Intelligent context assembly for LLM queries
- **Vector Search**: Cosine similarity search across embeddings
- **MMR Diversification**: Maximal Marginal Relevance for diverse results
- **Entity Summarization**: Concise summaries of risks and decisions
- **Document Snippets**: Relevant text chunks from uploaded documents

### 6. User Interface

#### Design System
- **Catalyst Components**: Professional UI component library
- **Responsive Design**: Mobile-first responsive layout
- **Three-Pane Layout**: Sidebar navigation, main content, chat dock
- **Dark/Light Mode**: CSS variable-based theming support

#### Navigation
- **App Sidebar**: Project navigation with org switcher
- **Project Selector**: Dropdown for project switching
- **Breadcrumbs**: Clear navigation hierarchy
- **Mobile Support**: Collapsible sidebar and mobile top bar

#### Forms and Validation
- **Real-time Validation**: On-blur validation with inline feedback
- **Issue Chips**: Visual indicators for validation issues
- **Form State Management**: React Hook Form with Zod validation
- **Optimistic Updates**: Immediate UI feedback with server sync

### 7. Security and Access Control

#### Authentication (Development)
- **Session Management**: Cookie-based session handling
- **User Stubbing**: Development-friendly user management
- **Org Switching**: Cookie-based organization context

#### Authorization
- **Role-Based Access**: Hierarchical permission system
- **Org-Level Roles**: Owner, admin, member, viewer
- **Project-Level Roles**: PM, member, viewer
- **Access Guards**: Server-side permission validation

#### Data Isolation
- **Multi-Tenancy**: Organization-scoped data access
- **Row-Level Security**: Database-level access control
- **Audit Logging**: Complete change tracking with actor identification

### 8. API Architecture

#### RESTful Endpoints
- **Projects**: `/api/projects` - CRUD operations with org scoping
- **Risks**: `/api/risks` - Risk management with validation
- **Decisions**: `/api/decisions` - Decision management with validation
- **Documents**: `/api/documents/*` - File upload and management
- **Attachments**: `/api/attachments` - File metadata listing
- **Organizations**: `/api/orgs/*` - Multi-tenant organization management
- **Chat**: `/api/chat` - AI-powered Q&A with context

#### Validation Endpoints
- **Risk Validation**: `/api/validate/risk` - AI-powered risk assessment
- **Decision Validation**: `/api/validate/decision` - AI-powered decision assessment

#### Background Processing
- **Job Queue**: pg-boss for document processing and embedding
- **Worker System**: Background job processing for heavy operations
- **Error Handling**: Retry logic and error tracking

### 9. Data Flow

#### Risk/Decision Lifecycle
1. **Creation**: User creates risk/decision via form
2. **Validation**: Real-time AI validation on form blur
3. **Issues**: Inline issue chips show validation problems
4. **Improvement**: AI suggests improvements via chat dock
5. **Approval**: Decision approval workflow with audit trail
6. **Embedding**: Automatic vector embedding for search

#### Document Processing Pipeline
1. **Upload**: User uploads file via pre-signed URL
2. **Commit**: Upload completion triggers processing job
3. **Extraction**: Worker extracts text from document
4. **Chunking**: Text is chunked for optimal embedding
5. **Embedding**: Vector embeddings generated and stored
6. **Indexing**: Document becomes searchable via semantic search

#### Q&A Flow
1. **Question**: User asks question in chat dock
2. **Context Packing**: System gathers relevant context
3. **Vector Search**: Semantic search for related content
4. **LLM Query**: Context-aware question sent to LLM
5. **Response**: Structured response with citations
6. **Display**: Answer shown with source references

### 10. Deployment and Infrastructure

#### Production Environment
- **Render.com**: Cloud hosting with automatic deployments
- **PostgreSQL**: Managed database with pgvector extension
- **S3 Storage**: Object storage for file uploads
- **Environment Variables**: Secure configuration management

#### Development Environment
- **Local Development**: Next.js dev server with hot reload
- **Database**: Local PostgreSQL with migration scripts
- **Mock Services**: Development-friendly LLM mocking
- **Hot Reload**: Instant feedback during development

#### Monitoring and Observability
- **Build Logs**: Render deployment logs and build status
- **Error Tracking**: Console error logging and user feedback
- **Performance**: Next.js built-in performance monitoring
- **Database**: Query performance and connection monitoring

## Key Features Summary

### ✅ Implemented Features
- **Multi-tenant Organization Management**: Complete org/user/invitation system
- **Project Management**: Full CRUD with role-based access control
- **Risk Management**: AI-validated risk register with exposure scoring
- **Decision Management**: AI-validated decision log with approval workflow
- **Document Management**: File upload, processing, and semantic search
- **AI-Powered Validation**: Real-time validation with issue detection
- **Contextual Q&A**: Global chat dock with semantic search
- **Vector Search**: pgvector-powered semantic search and retrieval
- **Background Processing**: pg-boss job queue for heavy operations
- **Audit Trail**: Complete change tracking with actor identification
- **Responsive UI**: Mobile-first design with Catalyst components
- **Real-time Validation**: On-blur validation with inline feedback

### 🔄 Workflow Integration
- **Form Validation**: Real-time AI validation with issue chips
- **Chat Assistance**: Context-aware Q&A with document citations
- **Document Processing**: Automatic text extraction and embedding
- **Approval Workflows**: Decision approval with audit trails
- **Multi-tenant Access**: Organization-scoped data and permissions

### 🎯 Business Value
- **AI-Enhanced PM**: Intelligent validation and assistance
- **Semantic Search**: Find relevant information across all content
- **Audit Compliance**: Complete change tracking and history
- **Multi-tenant SaaS**: Scalable organization management
- **Professional UI**: Enterprise-grade user experience
- **Document Intelligence**: AI-powered document processing and search

This architecture provides a comprehensive, AI-enhanced project management platform that combines traditional PM features with modern AI capabilities for intelligent validation, document processing, and contextual assistance.
