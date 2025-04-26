import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
class Rule {
  @Prop({ type: String, required: true })
  ruleText: string;

  @Prop({ type: Number, required: true })
  order: number;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);

@Schema()
class GroupHistory {
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastRenamed: Date;
}

@Schema()
class GroupIntroduction {
  @Prop({ required: true })
  summary: string;

  @Prop({ enum: ["public", "private"], required: true })
  visibility: "public" | "private";

  @Prop({ enum: ["everyone", "invited"], default: "everyone" })
  discoverability: "everyone" | "invited";

  @Prop({ type: GroupHistory, required: false, default: () => ({}) })
  history: GroupHistory;

  @Prop({ type: [String] })
  tags: string[];
}

export const GroupIntroductionSchema = SchemaFactory.createForClass(GroupIntroduction);
export const GroupHistorySchema = SchemaFactory.createForClass(GroupHistory);

@Schema({
  timestamps: true,
})
export class PublicGroup extends Document {
  @Prop({ required: true })
  groupName: string;

  @Prop()
  avatargroup: string;

  @Prop({ type: [RuleSchema], default: [] })
  rules: Rule[];

  @Prop({ type: GroupIntroductionSchema, required: true })
  introduction: GroupIntroduction;
}

export const PublicGroupSchema = SchemaFactory.createForClass(PublicGroup);