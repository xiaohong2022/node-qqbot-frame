import type { BotHost } from "../bot-host.js";

function memberMutePath(groupOpenid: string): string {
  return `/v2/groups/${encodeURIComponent(groupOpenid)}/restrict_chat_setting`;
}

function removeMembersPath(groupOpenid: string): string {
  return `/v2/groups/${encodeURIComponent(groupOpenid)}/batch_remove_members`;
}

/**
 * 禁言群成员到指定时刻。
 *
 * @param expireAtMs 禁言到期时间（Unix 毫秒时间戳）
 */
export async function muteMemberUntil(
  host: BotHost,
  groupOpenid: string,
  memberOpenid: string,
  expireAtMs: number,
): Promise<boolean> {
  try {
    const muteExpireAt = new Date(expireAtMs).toISOString();
    await host.bot.api.post(memberMutePath(groupOpenid), {
      members: [
        {
          op: "add",
          member_openid: memberOpenid,
          mute_expire_at: muteExpireAt,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** 解除群成员的禁言。 */
export async function unmuteMember(
  host: BotHost,
  groupOpenid: string,
  memberOpenid: string,
): Promise<boolean> {
  try {
    await host.bot.api.post(memberMutePath(groupOpenid), {
      members: [
        {
          op: "del",
          member_openid: memberOpenid,
          mute_expire_at: "",
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** 移除群成员，可选择同时加入群黑名单。 */
export async function removeMember(
  host: BotHost,
  groupOpenid: string,
  memberOpenid: string,
  addToMemberBlacklist: boolean,
): Promise<boolean> {
  try {
    const result = await host.bot.api.post<{ remove_members_result?: string }>(
      removeMembersPath(groupOpenid),
      {
        member_openids: [memberOpenid],
        add_to_member_blacklist: addToMemberBlacklist,
      },
    );
    return result?.remove_members_result === "success";
  } catch {
    return false;
  }
}
