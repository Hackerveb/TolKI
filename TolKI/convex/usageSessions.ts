import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Start a new translation session
export const startSession = mutation({
  args: {
    clerkId: v.string(),
    languageFrom: v.string(),
    languageTo: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has credits
    if (user.credits <= 0) {
      throw new Error("Insufficient credits");
    }

    // End any existing active sessions
    const activeSessions = await ctx.db
      .query("usageSessions")
      .withIndex("by_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        endedAt: Date.now(),
      });
    }

    // Create new session
    const sessionId = await ctx.db.insert("usageSessions", {
      userId: user._id,
      creditsUsed: 0,
      languageFrom: args.languageFrom,
      languageTo: args.languageTo,
      startedAt: Date.now(),
      isActive: true,
    });

    return sessionId;
  },
});

// End a translation session
export const endSession = mutation({
  args: {
    sessionId: v.id("usageSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      return; // Session already ended
    }

    await ctx.db.patch(args.sessionId, {
      isActive: false,
      endedAt: Date.now(),
    });

    // Return final session details
    return {
      creditsUsed: session.creditsUsed,
      duration: Date.now() - session.startedAt,
    };
  },
});

// Increment credits used in a session (called every minute)
export const incrementSessionCredits = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get active session
    const activeSession = await ctx.db
      .query("usageSessions")
      .withIndex("by_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .first();

    if (!activeSession) {
      throw new Error("No active session found");
    }

    // Check if user has credits
    if (user.credits <= 0) {
      // End session if no credits
      await ctx.db.patch(activeSession._id, {
        isActive: false,
        endedAt: Date.now(),
      });
      throw new Error("Insufficient credits - session ended");
    }

    // Deduct 1 credit from user
    await ctx.db.patch(user._id, {
      credits: user.credits - 1,
      lastActive: Date.now(),
    });

    // Increment credits used in session
    await ctx.db.patch(activeSession._id, {
      creditsUsed: activeSession.creditsUsed + 1,
    });

    return {
      creditsRemaining: user.credits - 1,
      sessionCreditsUsed: activeSession.creditsUsed + 1,
    };
  },
});

// Get active session for a user
export const getActiveSession = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    const activeSession = await ctx.db
      .query("usageSessions")
      .withIndex("by_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .first();

    return activeSession;
  },
});

// Get session history for a user
export const getSessionHistory = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const query = ctx.db
      .query("usageSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc");

    const sessions = args.limit
      ? await query.take(args.limit)
      : await query.collect();

    return sessions.map(session => ({
      ...session,
      duration: session.endedAt ? session.endedAt - session.startedAt : null,
    }));
  },
});

// Get total credits used today
export const getCreditsUsedToday = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return 0;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();

    const sessions = await ctx.db
      .query("usageSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const todaySessions = sessions.filter(
      session => session.startedAt >= todayStartTime
    );

    const totalCreditsToday = todaySessions.reduce(
      (sum, session) => sum + session.creditsUsed,
      0
    );

    return totalCreditsToday;
  },
});