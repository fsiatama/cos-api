export interface PaginationArgs<
  TWhereUniqueInput,
  TWhereInput,
  TOrderByWithRelationInput,
  TSelect,
> {
  skip?: number;
  take?: number;
  cursor?: TWhereUniqueInput;
  where?: TWhereInput;
  orderBy?: TOrderByWithRelationInput;
  select?: TSelect;
}
