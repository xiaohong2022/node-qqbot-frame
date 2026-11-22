/** 群成员类型。 */
export enum MemberType {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}

/** 将 QQ 平台返回的 `member_role` 转为 {@link MemberType}。 */
export function parseMemberType(role: unknown): MemberType {
  if (role === MemberType.ADMIN) {
    return MemberType.ADMIN;
  }
  if (role === MemberType.OWNER) {
    return MemberType.OWNER;
  }
  return MemberType.MEMBER;
}

/** 管理员或群主。 */
export function isMemberAdmin(type: MemberType): boolean {
  return type === MemberType.ADMIN || type === MemberType.OWNER;
}
