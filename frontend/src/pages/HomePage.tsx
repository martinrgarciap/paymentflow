import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  FileCheck2,
  Github,
  LayoutDashboard,
  Search,
  Send,
  Server,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

const GITHUB_URL = "https://github.com/martinrgarciap/paymentflow";

interface Technology {
  name: string;
  logo: string;
  tint: string;
}

interface TechnologyGroup {
  label: string;
  technologies: Technology[];
}

interface FlowStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Flow {
  number: number;
  title: string;
  eyebrow: string;
  accent: "blue" | "amber" | "teal";
  steps: FlowStep[];
}

const TECHNOLOGY_GROUPS: TechnologyGroup[] = [
  {
    label: "Backend",
    technologies: [
      {
        name: "Java 21",
        logo: "https://cdn.simpleicons.org/openjdk/E76F00",
        tint: "bg-orange-50 border-orange-100",
      },
      {
        name: "Spring Boot",
        logo: "https://cdn.simpleicons.org/springboot/6DB33F",
        tint: "bg-green-50 border-green-100",
      },
      {
        name: "PostgreSQL",
        logo: "https://cdn.simpleicons.org/postgresql/4169E1",
        tint: "bg-blue-50 border-blue-100",
      },
    ],
  },
  {
    label: "Frontend",
    technologies: [
      {
        name: "React",
        logo: "https://cdn.simpleicons.org/react/61DAFB",
        tint: "bg-cyan-50 border-cyan-100",
      },
      {
        name: "TypeScript",
        logo: "https://cdn.simpleicons.org/typescript/3178C6",
        tint: "bg-blue-50 border-blue-100",
      },
      {
        name: "Vite",
        logo: "https://cdn.simpleicons.org/vite/646CFF",
        tint: "bg-violet-50 border-violet-100",
      },
      {
        name: "Tailwind CSS",
        logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
        tint: "bg-cyan-50 border-cyan-100",
      },
    ],
  },
  {
    label: "Platform",
    technologies: [
      {
        name: "Railway",
        logo: "https://cdn.simpleicons.org/railway/0B0D0E",
        tint: "bg-gray-50 border-gray-200",
      },
      {
        name: "Vercel",
        logo: "https://cdn.simpleicons.org/vercel/000000",
        tint: "bg-gray-50 border-gray-200",
      },
    ],
  },
];

const FLOWS: Flow[] = [
  {
    number: 1,
    title: "Payment processing flow",
    eyebrow: "Create and process",
    accent: "blue",
    steps: [
      {
        title: "Payment form",
        description: "Selects an active recipient, amount, and reference.",
        icon: Send,
      },
      {
        title: "Confirmation",
        description: "Shows the transfer details before submission.",
        icon: FileCheck2,
      },
      {
        title: "Spring API",
        description: "Validates the request and authenticated sender.",
        icon: Server,
      },
      {
        title: "Risk decision",
        description: "Routes high-value payments to pending review.",
        icon: ShieldCheck,
      },
      {
        title: "PostgreSQL",
        description: "Stores the transaction and account balances.",
        icon: Database,
      },
    ],
  },
  {
    number: 2,
    title: "Admin review flow",
    eyebrow: "Review and decide",
    accent: "amber",
    steps: [
      {
        title: "Pending queue",
        description: "Surfaces payments that require manual review.",
        icon: AlertTriangle,
      },
      {
        title: "Search and filter",
        description: "Narrows activity by status, risk, or participant.",
        icon: Search,
      },
      {
        title: "Transaction detail",
        description: "Shows the amount, parties, note, and risk state.",
        icon: CreditCard,
      },
      {
        title: "Admin decision",
        description: "Approves or denies an eligible pending payment.",
        icon: UserCog,
      },
      {
        title: "State update",
        description: "Updates payment status and balances atomically.",
        icon: CheckCircle2,
      },
    ],
  },
  {
    number: 3,
    title: "User operations flow",
    eyebrow: "Manage and preview",
    accent: "teal",
    steps: [
      {
        title: "User directory",
        description: "Lists active and deactivated demo accounts.",
        icon: Users,
      },
      {
        title: "Account search",
        description: "Finds users by name or email address.",
        icon: Search,
      },
      {
        title: "Account controls",
        description: "Edits names or changes account availability.",
        icon: UserCog,
      },
      {
        title: "Admin Lens",
        description: "Previews the selected user's dashboard experience.",
        icon: Eye,
      },
      {
        title: "Return to admin",
        description: "Restores platform-wide operations in one action.",
        icon: LayoutDashboard,
      },
    ],
  },
];

const FLOW_STYLES = {
  blue: {
    panel: "border-blue-200 bg-blue-50/60",
    badge: "bg-blue-600",
    card: "border-blue-200",
    icon: "bg-blue-100 text-blue-700",
    arrow: "text-blue-300",
  },
  amber: {
    panel: "border-amber-200 bg-amber-50/60",
    badge: "bg-amber-500",
    card: "border-amber-200",
    icon: "bg-amber-100 text-amber-700",
    arrow: "text-amber-300",
  },
  teal: {
    panel: "border-emerald-200 bg-emerald-50/60",
    badge: "bg-emerald-600",
    card: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    arrow: "text-emerald-300",
  },
} as const;

function TechnologyGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold !tracking-normal !text-slate-900">
        Built With
      </h2>

      {TECHNOLOGY_GROUPS.map((group) => (
        <div
          key={group.label}
          className="grid gap-2 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-start"
        >
          <div className="pt-2 text-[11px] font-bold uppercase text-slate-500">
            {group.label}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {group.technologies.map((technology) => (
              <div
                key={technology.name}
                className={`flex min-h-12 items-center gap-2 border px-3 py-2 ${technology.tint}`}
              >
                <img
                  src={technology.logo}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                />
                <span className="min-w-0 text-xs font-semibold text-slate-700">
                  {technology.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ArchitectureFlow({ flow }: { flow: Flow }) {
  const styles = FLOW_STYLES[flow.accent];

  return (
    <section className={`border-l-4 p-4 md:p-5 ${styles.panel}`}>
      <div className="mb-4 flex items-center gap-3 text-left">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${styles.badge}`}
        >
          {flow.number}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase text-slate-500">
            {flow.eyebrow}
          </div>
          <h3 className="text-base font-bold text-slate-900">{flow.title}</h3>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {flow.steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="contents"
            >
              <div
                className={`flex min-h-24 flex-1 items-start gap-3 border bg-white p-3 text-left ${styles.card}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
                >
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs leading-4 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < flow.steps.length - 1 && (
                <ArrowRight
                  size={18}
                  strokeWidth={2.5}
                  className={`mx-auto shrink-0 rotate-90 lg:rotate-0 ${styles.arrow}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#f0f4f8] text-left text-slate-700">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase text-blue-700">
              <CircleDollarSign size={15} /> Payment operations simulator
            </div>
            <h1 className="m-0 text-4xl font-black leading-tight !tracking-normal !text-slate-950 md:text-5xl">
              PaymentFlow
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              A full-stack payment operations dashboard for creating transfers,
              reviewing risk, and managing demo users through an admin-first
              console.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/payments"
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <LayoutDashboard size={17} />
                Open Payment Console
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Github size={17} />
                View on GitHub
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" /> Demo
                payment data
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Responsive admin workflow
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <TechnologyGrid />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-blue-600">
                System architecture
              </div>
              <h2 className="mt-1 text-2xl font-black !tracking-normal !text-slate-950 md:text-3xl">
                How PaymentFlow Works
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Payments
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Admin review
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                User operations
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {FLOWS.map((flow) => (
              <ArchitectureFlow key={flow.title} flow={flow} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 max-w-2xl">
            <div className="text-xs font-bold uppercase text-blue-600">
              One system, two perspectives
            </div>
            <h2 className="mt-1 text-2xl font-black !tracking-normal !text-slate-950 md:text-3xl">
              Operations and user experience
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The Admin Lens previews a selected user's experience while the
              authenticated demo admin session remains active.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="border border-blue-200 bg-blue-50/50 p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  <LayoutDashboard size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Admin Console
                  </h3>
                  <p className="text-xs text-blue-700">Platform-wide view</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-600" />
                  Review payment totals, statuses, and risk flags.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-600" />
                  Approve or deny eligible pending transactions.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-600" />
                  Create, update, deactivate, and reactivate demo users.
                </li>
              </ul>
            </article>

            <article className="border border-emerald-200 bg-emerald-50/50 p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <UserRound size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    User Preview
                  </h3>
                  <p className="text-xs text-emerald-700">Admin Lens view</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  Preview a selected user's balance and payment activity.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  Filter the visible history by sent or received payments.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  Return to the complete admin dashboard at any time.
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: CircleDollarSign,
              color: "bg-blue-100 text-blue-700",
              title: "Payment lifecycle",
              description:
                "Create, validate, store, search, and review simulated transfers.",
            },
            {
              icon: ShieldCheck,
              color: "bg-amber-100 text-amber-700",
              title: "Risk-aware workflow",
              description:
                "High-value activity enters a pending state for an admin decision.",
            },
            {
              icon: Server,
              color: "bg-emerald-100 text-emerald-700",
              title: "Full-stack project",
              description:
                "Spring Boot, React, PostgreSQL, JWT authentication, and tested APIs.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="border border-slate-200 bg-white p-5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}
                >
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
