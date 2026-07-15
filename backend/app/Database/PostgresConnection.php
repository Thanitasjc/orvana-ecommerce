<?php

namespace App\Database;

use DateTimeInterface;
use Illuminate\Database\PostgresConnection as BasePostgresConnection;

/**
 * Postgres connection that stays compatible with PDO emulate prepares.
 *
 * Supabase transaction pooler (port 6543) requires PDO::ATTR_EMULATE_PREPARES.
 * Laravel's default prepareBindings() casts bool → int (0/1), which PostgreSQL
 * rejects for boolean columns ("datatype mismatch"). Bind true/false as strings
 * so the emulated SQL embeds 'true' / 'false', which Postgres accepts.
 */
class PostgresConnection extends BasePostgresConnection
{
    /**
     * @param  array<int|string, mixed>  $bindings
     * @return array<int|string, mixed>
     */
    public function prepareBindings(array $bindings)
    {
        $grammar = $this->getQueryGrammar();

        foreach ($bindings as $key => $value) {
            if ($value instanceof DateTimeInterface) {
                $bindings[$key] = $value->format($grammar->getDateFormat());
            } elseif (is_bool($value)) {
                $bindings[$key] = $value ? 'true' : 'false';
            }
        }

        return $bindings;
    }
}
