<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * Kolone koje se mogu masovno dodeljivati
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'order',
        'is_active',
    ];

    /**
     * Tipovi podataka za određene kolone
     */
    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Relacija: Jedna kategorija ima više tema
     */
    public function themes(): HasMany
    {
        return $this->hasMany(Theme::class);
    }

    /**
     * Relacija: Kategorija ima objave preko tema
     */
    public function posts()
    {
        return $this->hasManyThrough(Post::class, Theme::class);
    }

    /**
     * Scope za aktivne kategorije
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope za sortiranje po order i name
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    /**
     * Automatsko generisanje sluga kada se kreira kategorija
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = \Illuminate\Support\Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = \Illuminate\Support\Str::slug($category->name);
            }
        });
    }
}