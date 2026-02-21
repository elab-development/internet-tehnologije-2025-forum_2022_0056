<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/** 
 * @OA\Info(
 *      version="1.0.0",
 *      title="Planinarski Forum API",
 *      description="API dokumentacija za Planinarski Forum aplikaciju",
 *      @OA\Contact(
 *          email="admin@planinarskiforum.com"
 *      ),
 *      @OA\License(
 *          name="Apache 2.0",
 *          url="http://www.apache.org/licenses/LICENSE-2.0.html"
 *      )
 * )
 *
 * @OA\Server(
 *      url="http://localhost:8000",
 *      description="Lokalni server"
 * )
 */

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
