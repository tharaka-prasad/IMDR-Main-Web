<?php

namespace App\Exceptions;

use RuntimeException;

/** A rule of the institute was broken (batch full, refund too large ...). Shown to the user as an error message. */
class BusinessException extends RuntimeException
{
}
