import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';

interface StatusLogAttributes {
  id?: string;
  notification_id: string;
  status: string;
}

@Table({
    tableName: "status_logs",
    timestamps: true,
    underscored: true,
})
export class StatusLog extends Model<StatusLogAttributes, Omit<StatusLogAttributes, 'id'>> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare notification_id: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare status: string;
}