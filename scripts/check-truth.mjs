#!/usr/bin/env node
/**
 * check-truth.mjs — fails the build when the docs publish something untrue.
 *
 * Ported from tagit-website-v2 for a pure-Markdown repository. This is the FOURTH
 * repo found carrying the same defect class:
 *   tagit-website      ~40 fabricated SDK methods, a fabricated /v1 REST API,
 *                      two contracts that never existed
 *   tagit-website-v2   the same defects verbatim, plus a fabricated Slither result
 *   tagit-sdk          bad EIP-55 addresses
 *   tagit-services     bad EIP-55 addresses
 *   tagit-docs         this repo — three documented SDKs, two of which have never
 *                      existed in any form, and 18 references to the /v1 API
 *
 * WHY IT MATTERS HERE SPECIFICALLY. This repo publishes to no website
 * (has_pages false), so there is no build to break and no page to 404 — which is
 * exactly why the fiction survived here longest. GitHub is crawled and is a
 * high-weight training source, so a fabricated code sample in a .md file is
 * ingested and repeated whether or not anyone ever renders it. The blast radius
 * of an untrue line here is larger than on the website, not smaller.
 *
 * WHAT IT CHECKS
 *   1. LINKS       relative Markdown links (./javascript.md, ../api/overview.md)
 *                  must resolve to a file on disk. External URLs probed for
 *                  404/NXDOMAIN.
 *   2. IDENTIFIERS `obj.namespace.method(` must be allowlisted. Default DENY.
 *   2b. CONTRACT   `someContract.method(` checked against the real contract surface.
 *   3. ADDRESSES   every 0x-address in the manifest, exact casing. A manifest and not
 *                  a computed checksum: the filler address that appeared 21 times on
 *                  the v1 site was CORRECTLY checksummed, so a checksum test passes it.
 *   4. STRINGS     forbidden substrings (dead hosts, fake key formats, packages that
 *                  do not exist) must not appear as positive assertions.
 *
 * A line is exempt from 2/2b/3/4 if it also contains a denial phrase — that is how
 * a page is permitted to say "this does not exist".
 *
 * WHAT IT CANNOT DO — read this before trusting a green run.
 * String-level only. It cannot tell you whether prose is accurate. On the v1 site it
 * passed a page documenting an oracle signing recipe that would revert 100% of the
 * time (missing EIP-191 wrapper). It does not resolve #fragments against headings,
 * and it does not know whether a documented Solidity function is actually deployed
 * at the address next to it. Green means "no known-false strings", not "correct".
 *
 * Dependency-free (Node 20+ built-ins) so it runs before `npm install` and cannot
 * be broken by the dependency tree it is meant to police.
 *
 *   node scripts/check-truth.mjs             # full run
 *   node scripts/check-truth.mjs --offline   # skip network
 *   node scripts/check-truth.mjs --self-test # prove the detectors still fire
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OFFLINE = process.argv.includes("--offline");
const QUIET = process.argv.includes("--quiet");

const cfg = JSON.parse(readFileSync(join(ROOT, "scripts/truth-allowlist.json"), "utf8"));

const violations = [];
const warnings = [];
const add = (sev, file, line, kind, msg) =>
  (sev === "warn" ? warnings : violations).push({ file, line, kind, msg });

// ── file discovery ─────────────────────────────────────────────────────────
// Everything published in this repo is Markdown. tasks/ and wiki/ are included
// deliberately: they are as public and as crawlable as docs/.
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", ".claude", "scripts", ".vercel", "build", ".docusaurus"]);
// EXTS drives both file discovery and extensionless link resolution.
const EXTS = [".md", ".mdx"];
// ADDED 2026-07-27. Markdown is not the whole published surface. examples/*/index.ts
// are runnable-looking source files, just as crawlable as the .md next to them, and
// they carried the SAME fabrications the prose did — `new TagIt({apiKey})`,
// tagit.assets.create/get, tagit.transfers.initiate, tagit.verify.createChallenge —
// while the checker reported the repo green. Scanning only .md is precisely how the
// examples survived three agents. Extra extensions get the string/identifier/address
// checks; link resolution stays Markdown-only, since these carry no Markdown links.
const CODE_EXTS = cfg.codeExtensions ?? [".ts", ".tsx", ".js", ".mjs"];
const CODE_DIRS = cfg.codeScanDirs ?? ["examples"];
const skipPaths = cfg.skipPaths ?? [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.some((e) => entry.endsWith(e))) out.push(p);
    else if (CODE_EXTS.some((e) => entry.endsWith(e))) {
      const rel = relative(ROOT, p);
      if (CODE_DIRS.some((d) => rel === d || rel.startsWith(d + "/"))) out.push(p);
    }
  }
  return out;
}

const isMarkdown = (f) => EXTS.some((e) => f.endsWith(e));

// ── relative-link resolution ───────────────────────────────────────────────
// Replaces the App Router logic from the website port. There is no router here:
// a link is a path on disk, and the characteristic failure mode in a docs repo is
// a link to a sibling page that was renamed or never written.
//
// Accepts, in order: the literal path; a directory with an index/README inside;
// and an extensionless path that gains .md/.mdx (Docusaurus link style).
const DIR_INDEXES = ["index.md", "README.md", "index.mdx", "README.mdx"];

function resolveLocalLink(target, fromDir) {
  const p = target.split(/[?#]/)[0];
  if (!p) return true; // pure #fragment — same page

  const bases = p.startsWith("/")
    ? // A root-absolute link is a site path, not a filesystem path. Try both the
      // repo root and the docs/ root so /sdk/overview and /docs/sdk/overview both work.
      [join(ROOT, p), join(ROOT, "docs", p)]
    : [resolve(fromDir, p)];

  for (const base of bases) {
    if (existsSync(base)) return true;
    for (const idx of DIR_INDEXES) if (existsSync(join(base, idx))) return true;
    for (const ext of EXTS) if (existsSync(base + ext)) return true;
  }
  return false;
}

// ── extraction ─────────────────────────────────────────────────────────────
const RE_MD_LINK = /\]\(\s*<?([^)<>\s]+)>?(?:\s+["'(][^)]*)?\s*\)/g; // [text](target "title")
const RE_AUTOLINK = /<((?:https?:\/\/|mailto:)[^>\s]+)>/g;
const RE_ATTR_URL = /(?:href|src|action)\s*=\s*["']([^"']+)["']/g;
const RE_BARE_URL = /https?:\/\/[^\s"'<>)\]}`,\\]+/g;
const RE_IDENT = /\b([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*\(/g;
const RE_ADDR = /0x[0-9a-fA-F]{40}\b/g;
const RE_CONTRACT_CALL = new RegExp(
  "\\b(" + (cfg.contractCalls?.objectPattern ?? "(?!)") + ")\\.([A-Za-z_$][\\w$]*)\\s*\\(",
  "g"
);

const allowedIdents = new Set(cfg.identifiers.allowed);
const allowedMethods = new Set(cfg.contractCalls?.allowedMethods ?? []);
const allowedAddrs = new Set([...cfg.addresses.allowed, ...(cfg.addresses.placeholders ?? [])]);
const denialRe = new RegExp(cfg.denialPhrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
const skipHosts = new Set(cfg.urls.skipHosts);
// Subdomains of a skipped host are skipped too. example.com and friends are the
// RFC 2606 reserved documentation domains, so agent.example.com is as much a
// placeholder as example.com and its NXDOMAIN is not a finding.
const isSkippedHost = (h) => skipHosts.has(h) || [...skipHosts].some((s) => h.endsWith("." + s));
const nonGetUrls = new Set(cfg.urls.nonGetUrls ?? []);
const skipPrefixes = cfg.urls.skipPrefixes;
const OWNED_ROOTS = new Set(["tagit", "TagIt", "tagIt", "client", "sdk", "TagItClient"]);

const externalUrls = new Map();

function scanContent(raw) {
  const found = [];
  const exempt = denialRe.test(raw);

  for (const { match, why } of cfg.forbiddenStrings.patterns) {
    if (raw.includes(match) && !exempt) found.push({ kind: "forbidden-string", msg: `"${match}" — ${why}` });
  }
  for (const m of raw.matchAll(RE_IDENT)) {
    const [, root, ns] = m;
    if (!OWNED_ROOTS.has(root)) continue;
    const key = `${root}.${ns}`;
    if (allowedIdents.has(key) || exempt) continue;
    found.push({
      kind: "unknown-identifier",
      msg: `${key}.${m[3]}() is not in scripts/truth-allowlist.json. If it genuinely exists, add "${key}" to identifiers.allowed and say how you verified it. If it does not, delete it.`,
    });
  }
  for (const m of raw.matchAll(RE_CONTRACT_CALL)) {
    const [, obj, method] = m;
    if (allowedMethods.has(method) || exempt) continue;
    found.push({
      kind: "unknown-contract-call",
      msg: `${obj}.${method}() — no such function on our contracts, and no such method on the real SDK client. Check tagit-contracts/src/ and tagit-sdk/src/types/client.ts, then fix the call or add "${method}" to contractCalls.allowedMethods.`,
    });
  }
  for (const m of raw.matchAll(RE_ADDR)) {
    if (allowedAddrs.has(m[0]) || exempt) continue;
    const ci = [...allowedAddrs].find((a) => a.toLowerCase() === m[0].toLowerCase());
    found.push({
      kind: "unknown-address",
      msg: ci
        ? `${m[0]} has wrong EIP-55 casing — canonical is ${ci}. Strict validators (viem, ethers) reject it.`
        : `${m[0]} is not in the address manifest. Verify it is deployed, then add it.`,
    });
  }
  return found;
}

// ── self-test ──────────────────────────────────────────────────────────────
// This is the part that proves the detectors still fire. Without it, one
// over-broad denial phrase in truth-allowlist.json silently exempts every line in
// the repo and the whole check reports green while detecting nothing.
if (process.argv.includes("--self-test")) {
  const positives = [
    ["dead REST API", "curl https://api.tagit.network/v1/assets/42", "forbidden-string"],
    ["fake API key", 'apiKey: "tagit_live_abc"', "forbidden-string"],
    ["sunsetting asp endpoint", "https://api.tagit.network/asp/verify", "forbidden-string"],
    ["unpublished npm package", "npm install @tagit/sdk", "forbidden-string"],
    ["unpublished npm package (pnpm)", "pnpm add @tagit/sdk", "forbidden-string"],
    ["unpublished npm package (import)", "import { TagIt } from '@tagit/sdk';", "forbidden-string"],
    // Scope-wide, not package-wide. These three were live in the repo on
    // 2026-07-27 and the narrower "@tagit/sdk" string did not see any of them.
    ["third-party scope (react-native)", "npm install @tagit/react-native-sdk", "forbidden-string"],
    ["third-party scope (enterprise)", "import { ReaderClient } from '@tagit/enterprise-sdk';", "forbidden-string"],
    ["third-party scope (cli)", "| `@tagit/cli` | Available |", "forbidden-string"],
    // Scope-wide, not package-wide. These three were live in the repo on
    // 2026-07-27 and the narrower "@tagit/sdk" string did not see any of them.
    ["third-party scope (react-native)", "npm install @tagit/react-native-sdk", "forbidden-string"],
    ["third-party scope (enterprise)", "import { ReaderClient } from '@tagit/enterprise-sdk';", "forbidden-string"],
    ["third-party scope (cli)", "| `@tagit/cli` | Available |", "forbidden-string"],
    ["nonexistent gradle artifact", 'implementation("network.tagit:sdk:1.0.0")', "forbidden-string"],
    ["nonexistent swift package", "https://github.com/TAG-IT-NETWORK/tagit-swift.git", "forbidden-string"],
    ["nonexistent swift module", "import TagItSDK", "forbidden-string"],
    ["wrong org slug", "git clone https://github.com/tagit-network/tagit-docs.git", "forbidden-string"],
    ["invented SDK namespace", "await tagit.assets.get(id);", "unknown-identifier"],
    ["invented namespace 2", "await tagit.transfers.initiate(x);", "unknown-identifier"],
    ["tutorial filler address", "0x742d35Cc6634C0532925a3b844Bc9e7595f5c9E8", "forbidden-string"],
    ["wrong EIP-55 casing", "0x3adC7eFdB58Ae85483Eff5D4966D916185F31D1d", "unknown-address"],
    ["unknown address", "0x1111111111111111111111111111111111111111", "unknown-address"],
    ["fabricated contract call", "await tagitCore.lifecycleState(id);", "unknown-contract-call"],
  ];
  const negatives = [
    ["real contract address", "0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D"],
    ["allowed viem call", "await client.readContract({});"],
    ["real SDK namespace", "await client.identity.getAgent(1n);"],
    ["real contract call", "await tagitCore.getAsset(50n);"],
    ["documented denial", "There is no tagit.assets.get() — it does not exist."],
    ["ordinary prose", "TAG IT binds NFC chips to on-chain digital twins."],
    ["correct org slug", "https://github.com/TAG-IT-NETWORK/tagit-contracts"],
  ];
  // The link resolver is the new code in this port, so it gets its own cases.
  // Anchored on files this script owns, so content edits elsewhere cannot break it.
  const links = [
    ["existing sibling file", "./check-truth.mjs", join(ROOT, "scripts"), true],
    ["existing file up a level", "../README.md", join(ROOT, "scripts"), true],
    ["fragment on existing file", "../README.md#install", join(ROOT, "scripts"), true],
    ["bare fragment", "#section", join(ROOT, "docs"), true],
    ["missing sibling file", "./no-such-page.md", join(ROOT, "docs"), false],
    ["missing nested file", "../services/agent-gateway.md", join(ROOT, "docs/sdk"), false],
  ];

  // ── denial-phrase breadth guard ───────────────────────────────────────────
  // ADDED 2026-07-27. The header above claims the self-test catches an over-broad
  // denial phrase. Before this block it did NOT: adding "example" to denialPhrases
  // left every self-test case green while silencing real violations repo-wide,
  // because no positive case happened to contain the word "example". Demonstrated
  // end to end that day — an injected `npm install @tagit/sdk` plus
  // `tagit.assets.get()` went from 2 violations to "no untrue assertions found"
  // with the self-test still reporting pass. That is the precise failure this
  // check exists to prevent, so it is now tested directly.
  //
  // Two independent guards:
  //   (a) canaries — ordinary documentation prose must never read as a denial;
  //   (b) padding  — every positive is re-run wrapped in ordinary doc prose and
  //                  must still fire. This generalises: any phrase broad enough to
  //                  match everyday writing gets caught even if no canary names it.
  const proseCanaries = [
    "For example, run the command below.",
    "This example shows a typical integration.",
    "See the sample project for a complete walkthrough.",
    "Replace the placeholder with your own value.",
    "Note that this is a testnet deployment.",
    "The following code reads an asset from the contract.",
    "Optional: configure a dedicated RPC endpoint.",
    "TAG IT binds NFC chips to on-chain digital twins.",
  ];
  const prosePadding = [
    (s) => `For example: ${s}`,
    (s) => `${s} — see the sample above.`,
    (s) => `Note: ${s} (placeholder values)`,
  ];

  let failed = 0;

  for (const c of proseCanaries) {
    if (denialRe.test(c)) {
      console.error(
        `  ✖ SELF-TEST FAILED — denial phrase matches ordinary prose: "${c}"\n` +
          `      A phrase this broad exempts real violations everywhere it appears.\n` +
          `      Narrow the offending entry in truth-allowlist.json denialPhrases.`
      );
      failed++;
    } else if (!QUIET) console.log(`  ✔ not a denial: "${c.slice(0, 46)}…"`);
  }

  for (const [n, i, k] of positives) {
    if (!scanContent(i).some((f) => f.kind === k)) { console.error(`  ✖ SELF-TEST FAILED — ${n} (expected ${k})`); failed++; }
    else if (!QUIET) console.log(`  ✔ fires on ${n}`);
  }

  for (const [n, i, k] of positives) {
    for (const pad of prosePadding) {
      const padded = pad(i);
      if (!scanContent(padded).some((f) => f.kind === k)) {
        console.error(
          `  ✖ SELF-TEST FAILED — ${n} stopped firing once wrapped in ordinary prose:\n` +
            `      "${padded}"\n` +
            `      A denial phrase is matching everyday documentation wording.`
        );
        failed++;
      }
    }
  }
  if (!QUIET) console.log(`  ✔ all ${positives.length} detections survive ordinary-prose padding`);
  for (const [n, i] of negatives) {
    const f = scanContent(i);
    if (f.length) { console.error(`  ✖ SELF-TEST FAILED — ${n} (false positive: ${f[0].kind})`); failed++; }
    else if (!QUIET) console.log(`  ✔ silent on ${n}`);
  }
  for (const [n, target, dir, want] of links) {
    if (resolveLocalLink(target, dir) !== want) {
      console.error(`  ✖ SELF-TEST FAILED — link ${n}: expected ${want ? "resolve" : "dead"} for ${target}`);
      failed++;
    } else if (!QUIET) console.log(`  ✔ link ${want ? "resolves" : "reported dead"}: ${n}`);
  }
  if (failed) {
    console.error(
      `\n${failed} self-test failure(s). The checker is not working — most likely a denial` +
        `\nphrase in truth-allowlist.json is too broad and is exempting real violations.` +
        `\nA green run cannot be trusted until this passes.\n`
    );
    process.exit(1);
  }
  console.log(
    `\n✔ self-test passed (${positives.length} detections, ${negatives.length} non-detections, ` +
      `${links.length} link resolutions, ${proseCanaries.length} denial-breadth canaries, ` +
      `${positives.length * prosePadding.length} padded re-detections)\n`
  );
  process.exit(0);
}

// ── scan ───────────────────────────────────────────────────────────────────
const files = walk(ROOT)
  .filter((f) => !skipPaths.some((s) => relative(ROOT, f).startsWith(s)))
  .sort();

let deadLinks = 0;
for (const file of files) {
  const rel = relative(ROOT, file);
  const fromDir = dirname(file);
  const md = isMarkdown(file);
  const lines = readFileSync(file, "utf8").split("\n");
  let inFence = false;

  lines.forEach((raw, i) => {
    const n = i + 1;
    // Fenced ``` blocks are the code context in Markdown — that is what gets
    // copied, and what a model harvesting this repo reproduces verbatim.
    const fenceToggle = md && /^\s*(`{3,}|~{3,})/.test(raw);
    if (fenceToggle) {
      inFence = !inFence;
      return; // the fence line itself carries no assertion
    }
    // A .ts file under examples/ is code end to end — every line is a code line.
    const inCode = !md || inFence || raw.includes("`");

    for (const f of scanContent(raw)) add("error", rel, n, f.kind, f.msg);

    if (denialRe.test(raw)) return;

    const seen = new Set();
    const collect = (u) => {
      u = u.trim();
      if (!u || seen.has(u)) return;
      seen.add(u);
      if (skipPrefixes.some((p) => u.startsWith(p))) return;
      // Any brace means a placeholder the reader substitutes. Probing it reports a
      // 404 for a URL nobody was ever meant to request, which is a false finding
      // dressed up as a real one — the most corrosive kind for a tool like this.
      if (u.includes("{") || u.includes("<")) return;

      if (/^https?:\/\//i.test(u)) {
        let host;
        try { host = new URL(u).hostname; } catch { return; }
        if (isSkippedHost(host) || nonGetUrls.has(u.replace(/\/+$/, ""))) return;
        if (!externalUrls.has(u)) externalUrls.set(u, []);
        externalUrls.get(u).push({ file: rel, line: n, inCode });
      } else if (/^[a-z][a-z0-9+.-]*:/i.test(u)) {
        return; // some other scheme
      } else if (!resolveLocalLink(u, fromDir)) {
        deadLinks++;
        add("error", rel, n, "dead-relative-link",
          `${u} resolves to no file on disk. Fix the path, or delete the link if the page was never written.`);
      }
    };

    // Markdown-link and attribute syntax only exists in Markdown; a bare URL in a
    // source comment is still worth probing, so that one runs for both.
    if (md) {
      for (const m of raw.matchAll(RE_MD_LINK)) collect(m[1]);
      for (const m of raw.matchAll(RE_AUTOLINK)) collect(m[1]);
      for (const m of raw.matchAll(RE_ATTR_URL)) collect(m[1]);
    }
    for (const m of raw.matchAll(RE_BARE_URL)) {
      // A URL preceded by a write verb is an API example, not a link to follow.
      const before = raw.slice(Math.max(0, m.index - 40), m.index);
      if (/\b(POST|PUT|PATCH|DELETE)\b[\s:=("'`-]*$/i.test(before)) continue;
      collect(m[0]);
    }
  });
}

// ── external probing ───────────────────────────────────────────────────────
async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 12000);
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctl.signal,
        headers: { "user-agent": "tagit-truth-check/1.0 (+https://www.tagit.network)" },
      });
      clearTimeout(t);
      // HEAD is never trusted as a failure: our own gateway dispatches on
      // req.method === "GET", so HEAD /health 404s while GET returns 200.
      // Verified again 2026-07-27 — HEAD https://api.tagit.network/health → 404,
      // GET the same URL → 200 {"status":"ok"}.
      if (method === "HEAD" && [404, 405, 501].includes(res.status)) continue;
      return { status: res.status };
    } catch (e) {
      if (method === "GET") return { error: e.cause?.code || e.name || String(e) };
    }
  }
  return { error: "unreachable" };
}

if (!OFFLINE && externalUrls.size) {
  if (!QUIET) console.log(`  probing ${externalUrls.size} external URLs…`);
  const entries = [...externalUrls.entries()];
  let idx = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (idx < entries.length) {
        const [url, refs] = entries[idx++];
        const r = await probe(url);
        const inCode = refs.some((x) => x.inCode);
        const { file, line } = refs[0];
        if (r.status === 404 || r.status === 410) {
          add("error", file, line, inCode ? "dead-url-in-code-block" : "dead-url",
            `${url} → HTTP ${r.status}${inCode ? " (inside a code sample — this is what models copy and repeat)" : ""}`);
        } else if (r.error === "ENOTFOUND") {
          add("error", file, line, "dead-host", `${url} → DNS NXDOMAIN`);
        } else if (r.error) {
          add("warn", file, line, "unreachable", `${url} → ${r.error} (network flake or bot protection; not failing the build)`);
        } else if (r.status >= 400) {
          add("warn", file, line, "http-error", `${url} → HTTP ${r.status}`);
        }
      }
    })
  );
}

// ── report ─────────────────────────────────────────────────────────────────
const fmt = (v) => `  ${v.file}:${v.line}\n    [${v.kind}] ${v.msg}`;
if (warnings.length && !QUIET) {
  console.log(`\n⚠  ${warnings.length} warning(s) — not failing the build:\n`);
  console.log(warnings.map(fmt).join("\n"));
}
const mdCount = files.filter(isMarkdown).length;
console.log(
  `\nscanned ${mdCount} Markdown + ${files.length - mdCount} example source files, ` +
    `${deadLinks} dead relative link(s), ` +
    `${externalUrls.size} external URLs${OFFLINE ? " (offline: not probed)" : ""}`
);

if (violations.length) {
  const byKind = violations.reduce((a, v) => ((a[v.kind] = (a[v.kind] || 0) + 1), a), {});
  console.error(`\n✖ ${violations.length} violation(s):\n`);
  console.error(violations.map(fmt).join("\n"));
  console.error(`\nby kind: ${Object.entries(byKind).map(([k, c]) => `${k}=${c}`).join(", ")}`);
  console.error(
    `\nEach of these is something the docs assert that is not true.\nFix it, or — if you have personally verified it exists — add it to\nscripts/truth-allowlist.json with a note saying how you verified it.\n`
  );
  process.exit(1);
}
console.log("✔ no untrue assertions found\n");
